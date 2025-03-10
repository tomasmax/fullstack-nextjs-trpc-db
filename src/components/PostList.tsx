import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { trpcReact } from "@/trpc/trpcReact";
import { Box, Typography, Button, TextField } from "@mui/material";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";

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

  useEffect(() => {
    if (data) {
      setLocalPosts(data.pages.flatMap((page) => page.posts));
    }
  }, [data]);

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 200,
  });

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

  const renderRow = ({ index, key, parent, style }) => {
    const post = localPosts[index];
    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <div ref={registerChild} style={style}>
            <PostItem
              post={post}
              comment={comments[post.id] || ""}
              showComments={showComments[post.id]}
              onCommentChange={handleCommentChange}
              onAddComment={handleAddComment}
              onToggleComments={toggleComments}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100vh"
    >
      <AutoSizer style={{ width: "100%" }}>
        {({ height, width }) => (
          <List
            width={width}
            height={height}
            deferredMeasurementCache={cache}
            rowHeight={cache.rowHeight}
            rowRenderer={renderRow}
            rowCount={localPosts.length}
            overscanRowCount={3}
            onRowsRendered={({ stopIndex }) => {
              if (
                stopIndex === localPosts.length - 1 &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
          />
        )}
      </AutoSizer>
      {isFetchingNextPage && (
        <div style={{ position: "fixed", bottom: 10 }}>Loading more...</div>
      )}
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

const PostItem: React.FC<PostItemProps> = memo(
  ({
    post,
    comment,
    showComments,
    onCommentChange,
    onAddComment,
    onToggleComments,
  }) => {
    return (
      <Box border={1} padding={2} margin={2}>
        <Typography variant="h5">{post.id}</Typography>
        <Typography variant="h5">{post.title}</Typography>
        <Typography variant="body1">{post.content}</Typography>
        {post.comments.length > 0 && (
          <Button variant="contained" onClick={() => onToggleComments(post.id)}>
            Comments ({post.comments.length})
          </Button>
        )}
        {showComments && (
          <Box>
            {post.comments.map((comment: { id: number; content: string }) => (
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
);

PostItem.displayName = "PostItem";

export default PostList;
