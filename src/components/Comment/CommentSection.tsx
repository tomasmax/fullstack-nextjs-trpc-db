import React, { useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { trpcReact } from "@/trpc/trpcReact";

interface CommentSectionProps {
  postId: number;
  onContentChange?: () => void;
  forceRefresh?: boolean;
  onCommentsLoaded?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onContentChange,
  forceRefresh = false,
  onCommentsLoaded,
}) => {
  const theme = useTheme();

  // Use different query options based on whether we need a fresh fetch
  const queryOptions = {
    staleTime: forceRefresh ? 0 : 60000, // Cache for 60 seconds by default
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  };

  const {
    data: comments,
    isLoading,
    error,
    isSuccess,
  } = trpcReact.getCommentsByPostId.useQuery({ postId }, queryOptions);

  // Notify parent when content changes (comments loaded)
  useEffect(() => {
    if (isSuccess) {
      if (onContentChange) {
        setTimeout(onContentChange);
      }

      if (onCommentsLoaded) {
        onCommentsLoaded();
      }
    }
  }, [isSuccess, comments, onContentChange, onCommentsLoaded]);

  if (isLoading) return <CircularProgress size={24} />;

  if (error)
    return <Typography color="error">Error loading comments</Typography>;

  if (!comments || comments.length === 0) {
    return <Typography variant="body2">No comments yet</Typography>;
  }

  return (
    <Box
      sx={{
        marginBottom: 2,
        maxWidth: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
      }}
    >
      <List
        sx={{
          width: "100%",
          padding: 0,
          borderLeft: `4px solid ${theme.palette.divider}`,
        }}
      >
        {comments.map((comment) => (
          <React.Fragment key={`comment-${comment.id}-${postId}`}>
            <Divider />
            <ListItem alignItems="flex-start" sx={{ py: 1 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {comment.content}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default CommentSection;
