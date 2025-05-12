import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type TopicTextType = {
  _id: string;
  title: string;
  content: string;
  defaultCollectionId: string | undefined;
};

type GetTopicTextsResponse = {
  texts: TopicTextType[];
  textsCount: number;
  nextPage: number;
};

const useGetTopicTexts = (topicId: string, enabled: boolean) => {
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
    queryKey: ["topic-texts", topicId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `topic/texts/${topicId}?page=${pageParam}`,
        { signal }
      );
      return response.data as GetTopicTextsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const texts = useMemo(() => {
    return data?.pages.flatMap((page) => page.texts);
  }, [data]);

  return {
    texts,
    textsCount: data?.pages[0]?.textsCount,
    fetchNextPage,
    isLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetTopicTexts;
