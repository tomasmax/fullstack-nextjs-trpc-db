import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { trpcReact } from "@/trpc/trpcReact";
import { Box, Typography, Button, TextField } from "@mui/material";

const PostList: React.FC = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpcReact.infinitePosts.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const addComment = trpcReact.addComment.useMutation({
    onSuccess: (newComment) => {
      setLocalPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === newComment.postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
    },
  });
  const [localPosts, setLocalPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>(
    {}
  );
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (data) {
      setLocalPosts(data.pages.flatMap((page) => page.posts));
    }
  }, [data]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("Last post is in view, fetching next page...");
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, fetchNextPage]
  );

  const handleAddComment = (postId: number) => {
    if (comments[postId]) {
      addComment.mutate({ postId, content: comments[postId] });
      setComments({ ...comments, [postId]: "" });
    }
  };

  const handleCommentChange = useCallback((postId: number, value: string) => {
    setComments((prevComments) => ({ ...prevComments, [postId]: value }));
  }, []);

  const toggleComments = (postId: number) => {
    setShowComments((prevShowComments) => ({
      ...prevShowComments,
      [postId]: !prevShowComments[postId],
    }));
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {localPosts?.map((post, index) => (
        <PostItem
          key={`post-${post.id}-${index}`}
          post={post}
          comment={comments[post.id] || ""}
          showComments={showComments[post.id]}
          onCommentChange={handleCommentChange}
          onAddComment={handleAddComment}
          onToggleComments={toggleComments}
          ref={index === localPosts.length - 1 ? lastPostElementRef : null}
        />
      ))}
      {isFetchingNextPage && <div>Loading more...</div>}
      {isLoading && <div>Loading...</div>}
    </Box>
  );
};

interface PostItemProps {
  post: any;
  comment: string;
  showComments?: boolean;
  onCommentChange: (postId: number, value: string) => void;
  onAddComment: (postId: number) => void;
  onToggleComments: (postId: number) => void;
}

const PostItem = memo(
  React.forwardRef<HTMLDivElement, PostItemProps>(
    (
      {
        post,
        comment,
        showComments,
        onCommentChange,
        onAddComment,
        onToggleComments,
      },
      ref
    ) => {
      return (
        <Box ref={ref} border={1} padding={2} margin={2} width="50%">
          <Typography variant="h5">{post.id}</Typography>
          <Typography variant="h5">{post.title}</Typography>
          <Typography variant="body1">{post.content}</Typography>
          {post.comments.length > 0 && (
            <Button
              variant="contained"
              onClick={() => onToggleComments(post.id)}
            >
              Comments ({post.comments.length})
            </Button>
          )}
          {showComments && (
            <Box>
              {post.comments.map((comment) => (
                <Typography
                  key={`comment-${comment.id}-${post.id}`}
                  variant="body2"
                >
                  {comment.content}
                </Typography>
              ))}
            </Box>
          )}
          <Box>
            <TextField
              label="Add a comment"
              value={comment}
              onChange={(e) => onCommentChange(post.id, e.target.value)}
            />
            <Button onClick={() => onAddComment(post.id)}>Submit</Button>
          </Box>
        </Box>
      );
    }
  )
);

PostItem.displayName = "PostItem";

export default PostList;
