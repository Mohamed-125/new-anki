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
  hasNextPage: boolean,
  elementId?: string
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
      if (elementId) {
        const element = document.getElementById(elementId)!;
        let scrollHeight = element.scrollHeight;
        let scrollTop = element.scrollTop;

        let windowHeight = element.clientHeight;
        let scrollPercentage =
          (Math.round(scrollTop + windowHeight) / Math.round(scrollHeight)) *
          100;

        console.log(scrollPercentage, hasNextPage);
        if (scrollPercentage > 97 && hasNextPage) {
          console.log("fetch next page");
          fetchNextPage();
        }
      } else {
        let scrollHeight = document.documentElement.scrollHeight;
        let scrollTop = document.documentElement.scrollTop;
        let windowHeight = document.documentElement.clientHeight;
        let scrollPercentage =
          (Math.round(scrollTop + windowHeight) / Math.round(scrollHeight)) *
          100;

        if (scrollPercentage > 97 && hasNextPage) {
          fetchNextPage();
        }
      }
    };

    document.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    if (elementId) {
      const element = document.getElementById(elementId);
      element?.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (elementId) {
        const element = document.getElementById(elementId);
        element?.removeEventListener("scroll", handleScroll);
      }

      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [fetchNextPage, hasNextPage]);

  return {};
};

export default useInfiniteScroll;
