import React from "react";
import { trpcReact } from "@/trpc/trpcReact";
import { Box, TextField, Button } from "@mui/material";

interface CommentInputProps {
  postId: number;
  comment: string;
  onCommentChange: (postId: number, value: string) => void;
  onCommentAdded: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  comment,
  onCommentChange,
  onCommentAdded,
}) => {
  const utils = trpcReact.useUtils();

  const { mutate: addComment, isLoading } = trpcReact.addComment.useMutation({
    // Optimistic updates for API cache
    onMutate: async (newComment) => {
      // Get snapshot of current data
      const prevComments = utils.getCommentsByPostId.getData({ postId }) || [];

      const optimisticComment = {
        id: Date.now(), // use a unique id library better
        content: newComment.content,
        postId: newComment.postId,
      };

      // Optimistically update the cache
      utils.getCommentsByPostId.setData({ postId }, [
        ...prevComments,
        optimisticComment,
      ]);

      return { prevComments };
    },

    // When successful, notify parent and update data
    onSuccess: (data, variables) => {
      // I opted to optimistically update the cache, so no need to update the cache here
      // another option would be to wait until success and update the cache here
      onCommentAdded();
    },

    // Rollback on error
    onError: (error, variables, context) => {
      // Revert to previous data and show a toast maybe?
    },
  });

  const handleSubmit = () => {
    if (comment.trim()) {
      addComment({
        postId,
        content: comment,
      });
    }
  };

  return (
    <Box sx={{ marginTop: 2 }}>
      <TextField
        label="Add a comment"
        value={comment}
        onChange={(e) => onCommentChange(postId, e.target.value)}
        variant="outlined"
        fullWidth
        style={{ marginBottom: 8 }}
        size="small"
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isLoading || !comment.trim()}
      >
        {isLoading ? "Sending..." : "Submit"}
      </Button>
    </Box>
  );
};

export default CommentInput;
