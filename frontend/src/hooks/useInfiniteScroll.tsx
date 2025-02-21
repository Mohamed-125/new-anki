import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";
import React, { useEffect } from "react";

const useInfiniteScroll = (
  fetchNextPage: (
    options?: FetchNextPageOptions
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
) => {
  useEffect(() => {
    const checkInitialLoad = () => {
      const scrollHeight = document.body.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;

      if (scrollHeight <= windowHeight) {
        console.log("Initial load: Fetching next page");
        fetchNextPage({});
      }
    };

    // Call the check on the first render
    setTimeout(() => checkInitialLoad(), 1500);
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.clientHeight;
      const scrollPercentage =
        (Math.round(scrollTop + windowHeight) / Math.round(scrollHeight)) * 100;

      if (scrollPercentage > 97) {
        fetchNextPage();
      }
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage]);

  return {};
};

export default useInfiniteScroll;
