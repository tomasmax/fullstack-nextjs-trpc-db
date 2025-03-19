import React, { memo, useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import CommentSection from "@/components/Comment/CommentSection";
import CommentInput from "@/components/Comment/CommentInput";
import { PostExtended } from "@/types/prisma";

interface PostItemProps {
  post: PostExtended;
  onHeightChange: () => void;
  initialShowComments?: boolean;
  onCommentVisibilityChange?: (isVisible: boolean) => void;
  authorName: string;
}

const PostItem = memo(
  ({
    post,
    onHeightChange,
    initialShowComments = false,
    onCommentVisibilityChange,
    authorName,
  }: PostItemProps) => {
    const [showComments, setShowComments] = useState(initialShowComments);
    const [comment, setComment] = useState("");
    const [commentCount, setCommentCount] = useState(
      post._count?.comments || 0
    );
    const [commentsModified, setCommentsModified] = useState(false);

    // Initialize from prop on first render or when initialShowComments changes
    useEffect(() => {
      if (initialShowComments !== showComments) {
        setShowComments(initialShowComments);
      }
    }, [initialShowComments, showComments]);

    // Update local commentCount when post prop changes
    useEffect(() => {
      if (post._count?.comments !== undefined) {
        setCommentCount(post._count.comments);
      }
    }, [post._count?.comments]);

    const handleToggleComments = () => {
      const newVisibility = !showComments;
      setShowComments((prevState) => !prevState);

      // Notify parent about visibility change for persistence row height
      if (onCommentVisibilityChange) {
        onCommentVisibilityChange(newVisibility);
      }

      onHeightChange();
    };

    const handleCommentChange = (_postId: number, value: string) => {
      setComment(value);
    };

    const handleCommentAdded = () => {
      setComment("");
      setCommentCount((prev) => prev + 1);
      setCommentsModified(true);
      setTimeout(onHeightChange);
    };

    return (
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          padding: 2,
          margin: 2,
          width: "100%",
          maxWidth: "800px",
          borderRadius: 1,
          boxSizing: "border-box",
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5">{post.id}</Typography>
        <Typography variant="h5">{post.title}</Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            maxWidth: "100%",
          }}
        >
          {post.content}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          By: {authorName}
        </Typography>

        <Box sx={{ marginBottom: 2 }}>
          {commentCount > 0 && (
            <Button variant="contained" onClick={handleToggleComments}>
              {showComments ? "Hide" : "Show"} Comments ({commentCount})
            </Button>
          )}
        </Box>

        {showComments && (
          <CommentSection
            postId={post.id}
            onContentChange={onHeightChange}
            forceRefresh={commentsModified}
            onCommentsLoaded={() => {
              // Reset the flag once comments have been properly loaded with fresh data
              if (commentsModified) {
                setCommentsModified(false);
              }
            }}
          />
        )}

        <CommentInput
          postId={post.id}
          comment={comment}
          onCommentChange={handleCommentChange}
          onCommentAdded={handleCommentAdded}
        />
      </Box>
    );
  }
);

PostItem.displayName = "PostItem";

export default PostItem;
