import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";
import React, { useEffect } from "react";

const useInfiniteScroll = (
  fetchNextPage: (
    options?: FetchNextPageOptions
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>,
  hasNextPage: boolean
) => {
  useEffect(() => {
    const checkInitialLoad = () => {
      const scrollHeight = document.body.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;

      if (Math.floor(scrollHeight) <= Math.floor(windowHeight) && hasNextPage) {
        fetchNextPage();
      }
    };

    setTimeout(() => checkInitialLoad(), 500);

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.clientHeight;
      const scrollPercentage =
        (Math.round(scrollTop + windowHeight) / Math.round(scrollHeight)) * 100;

      if (scrollPercentage > 99 && hasNextPage) {
        fetchNextPage();
      }
    };

    document.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [fetchNextPage, hasNextPage]);

  return {};
};

export default useInfiniteScroll;
