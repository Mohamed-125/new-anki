import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import useGetCurrentUser from "./useGetCurrentUser";
import { VideoType } from "./useGetVideos";
import { TextType } from "./useGetTexts";

export type TopicType = {
  _id: string;
  title: string;
  language?: string;
  lessons?: any[];
  lists?: any[];
  type: "lessons" | "lists";
  userId?: string;
};

type GetTopicsResponse = {
  topics: TopicType[];
  topicsCount: number;
  nextPage: number;
};

const useGetTopics = ({
  enabled = true,
  query,
  language,
}: {
  enabled?: boolean;
  query?: string;
  language?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();

  // Build query key based on parameters
  let queryKey = query ? ["topics", query] : ["topics"];

  // Add language to query key if available
  if (language || selectedLearningLanguage) {
    queryKey.push(language || selectedLearningLanguage);
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isInitialLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      let url = `topic/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (language || selectedLearningLanguage) {
        url += `&language=${language || selectedLearningLanguage}`;
      }

      try {
        const response = await axios.get(url, { signal });
        if (response.data) return response.data as GetTopicsResponse;
      } catch (err) {
        console.log(err);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage;
    },
    enabled: enabled,
  });

  // Flatten the pages data to get all topics
  const topics = useMemo(() => {
    return data?.pages.flatMap(
      (page) => (page as GetTopicsResponse)?.topics || []
    );
  }, [data]);

  const queryClient = useQueryClient();

  return {
    topics,
    topicsCount: data?.pages[0]?.topicsCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetTopics;
