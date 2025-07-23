import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";
import React, { useEffect, useRef, ReactNode } from "react";
import { components } from "react-select";
import { Virtuoso } from "react-virtuoso";

interface InfiniteScrollProps {
  fetchNextPage: (
    options?: FetchNextPageOptions
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>;
  hasNextPage: boolean;
  children: ReactNode;
  className?: string;
  loadingElement?: ReactNode;
  isFetchingNextPage?: boolean;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  fetchNextPage,
  hasNextPage,
  children,
  className = "",
  isFetchingNextPage,
  loadingElement = <div>Loading...</div>,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage) {
          console.log("fetching next page");
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.02,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const items = React.Children.toArray(children); // ✅ Convert to array

  return (
    <>
      {false ? (
        <Virtuoso
          useWindowScroll
          style={{ display: "inherit" }}
          className={className}
          data={items} // ✅ Must be an array
          itemContent={(index) => items[index]} // ✅ Render each child by index
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          components={{
            Footer: () =>
              hasNextPage || isFetchingNextPage ? (
                <div style={{ padding: "1rem", textAlign: "center" }}>
                  {loadingElement}
                </div>
              ) : null,
          }}
        />
      ) : (
        <div className={`${className}`}>
          {children}
          <div ref={observerTarget} style={{}} className="infinite-scroll">
            {(hasNextPage && isFetchingNextPage) ||
            isFetchingNextPage ||
            hasNextPage
              ? loadingElement
              : null}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InfiniteScroll);
