import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type ListType = {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  language: string;
  thumbnail: string;
  order: number;
  topicId: string;
  createdAt: string;
  updatedAt: string;
};

type GetTopicListsResponse = {
  lists: ListType[];
  listsCount: number;
  nextPage: number;
};

const useGetTopicLists = (topicId: string, enabled: boolean) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["topic-lists", topicId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `list?page=${pageParam}&topicId=${topicId}`,
        { signal }
      );
      return response.data as GetTopicListsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const lists = useMemo(() => {
    return data?.pages.flatMap((page) => page.lists);
  }, [data]);

  return {
    lists,
    listsCount: data?.pages[0]?.listsCount,
    fetchNextPage,
    isLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetTopicLists;
