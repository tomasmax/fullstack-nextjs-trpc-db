import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  ListRowProps,
} from "react-virtualized";
import { debounce } from "@/utils/debounce";
import PostItem from "./PostItem";
import {
  LoadingOverlay,
  LoadingMore,
} from "@/components/LoadingIndicators/LoadingIndicators";
import { PostExtended } from "@/types/prisma";

interface PostListProps {
  postsData: {
    pages: Array<{
      posts: PostExtended[];
    }>;
  };
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => Promise<unknown>;
}

const ROW_DEFAULT_HEIGHT = 400;

// Persistent cache of the rows, using CellMeasurer, to dynamically measure the height of the rows
// https://blog.logrocket.com/rendering-large-lists-react-virtualized/
// https://github.com/bvaughn/react-virtualized/blob/master/docs/CellMeasurer.md
const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: ROW_DEFAULT_HEIGHT,
  minHeight: 250,
});

const PostList: React.FC<PostListProps> = ({
  postsData,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}) => {
  const [localPosts, setLocalPosts] = useState<PostExtended[]>([]);
  const listRef = useRef<List>(null);
  const lastMeasuredPositionRef = useRef<number>(0);

  // Create a persistent ref to track which posts have their comments open, this way open comments are not closed when virtualized list elements are mounted/unmounted
  // the CLS is affected when comment sections are open,and a users scrolls, as the element height is higher than when closed, but the usability is better
  const openCommentsRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (!postsData) return;

    const newPosts = postsData.pages.flatMap((page) => page.posts);
    const currentCount = localPosts.length;

    // Only update if the post count has changed
    if (newPosts.length !== currentCount) {
      setLocalPosts(newPosts);

      // If we're adding new posts (not just replacing or removing)
      if (newPosts.length > currentCount && currentCount > 0) {
        setTimeout(() => {
          // Clear cache only for new rows
          for (let i = currentCount; i < newPosts.length; i++) {
            cache.clear(i, 0);
          }

          // Recompute row heights from where new posts were added
          listRef.current?.recomputeRowHeights(currentCount);
        });
      }
    }
  }, [localPosts.length, postsData]);

  // PERFORMANCE: Debounce resize handlers to prevent unnecessary recalculations
  useEffect(() => {
    const handleResize = debounce(() => {
      if (cache && listRef.current) {
        cache.clearAll();
        listRef.current.recomputeRowHeights();
      }
    }, 150);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handler for tracking comment visibility changes
  const handleCommentVisibilityChange = (
    postId: number,
    isVisible: boolean
  ) => {
    openCommentsRef.current[postId] = isVisible;
  };

  // Handler for when a post's height changes
  const handleRowHeightChange = (index: number) => {
    if (cache && listRef.current) {
      cache.clear(index, 0);
      listRef.current.recomputeRowHeights(index);
    }
  };

  const renderRow = ({ index, key, parent, style }: ListRowProps) => {
    const post = localPosts[index];
    // Check if this post has its comments open
    const commentsVisible = openCommentsRef.current[post.id] || false;

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <Box
            ref={registerChild}
            style={{
              ...style,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              paddingBottom: 16,
            }}
          >
            <PostItem
              post={post}
              onHeightChange={() => handleRowHeightChange(index)}
              initialShowComments={commentsVisible}
              onCommentVisibilityChange={(isVisible) =>
                handleCommentVisibilityChange(post.id, isVisible)
              }
              authorName={post.author?.name || "Unknown author"}
            />
          </Box>
        )}
      </CellMeasurer>
    );
  };

  const handleScroll = ({ scrollTop }: { scrollTop: number }) => {
    lastMeasuredPositionRef.current = scrollTop;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        width: "100%",
        padding: 0,
      }}
    >
      <AutoSizer style={{ width: "100%" }}>
        {({ height, width }) => (
          // PERFORMANCE: Using virtualization for rendering large lists
          // Only elements in viewport (plus a small overscan) are actually rendered in the DOM
          <List
            ref={listRef}
            width={width}
            height={height}
            deferredMeasurementCache={cache}
            rowHeight={cache.rowHeight}
            rowRenderer={renderRow}
            rowCount={localPosts.length}
            overscanRowCount={3} // PERFORMANCE: Balance between smooth scrolling and memory usage https://github.com/bvaughn/react-virtualized/blob/master/docs/overscanUsage.md
            onScroll={handleScroll}
            // Infinite scroll handling to detect when the user is near the end of the list
            onRowsRendered={({ stopIndex }) => {
              if (
                stopIndex >= localPosts.length - 2 &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
            estimatedRowSize={ROW_DEFAULT_HEIGHT}
            scrollToAlignment="start"
          />
        )}
      </AutoSizer>

      <LoadingMore isFetchingNextPage={isFetchingNextPage} />
      <LoadingOverlay isLoading={isLoading} />
    </Box>
  );
};

export default PostList;
