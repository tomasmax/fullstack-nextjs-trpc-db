import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
}) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        bgcolor: "rgba(255,255,255,0.7)",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

interface LoadingMoreProps {
  isFetchingNextPage: boolean;
}

export const LoadingMore: React.FC<LoadingMoreProps> = ({
  isFetchingNextPage,
}) => {
  if (!isFetchingNextPage) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: "8px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <CircularProgress size={20} style={{ marginRight: 8 }} />
      <span>Loading more posts...</span>
    </Box>
  );
};
