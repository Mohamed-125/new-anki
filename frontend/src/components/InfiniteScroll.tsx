import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";
import React, { useEffect, useRef, ReactNode } from "react";

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
        threshold: 0.2,
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

  return (
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
  );
};

export default InfiniteScroll;
