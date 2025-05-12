import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import useGetCurrentUser from "./useGetCurrentUser";

export type TextType = {
  _id: string;
  title: string;
  content: string;
  topicId?: string;
  listId?: string;
  userId: string;
  defaultCollectionId: string | undefined;
};

type GetTextsResponse = {
  texts: TextType[];
  textsCount: number;
  nextPage: number;
};

const useGetTexts = ({
  enabled = true,
  query,
}: {
  enabled?: boolean;
  query?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey = query ? ["texts", query] : ["texts"];

  queryKey.push(selectedLearningLanguage);

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
      let url = `text/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

      const response = await axios.get(url, { signal });
      return response.data as GetTextsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const texts = useMemo(() => {
    return data?.pages.flatMap((page) => page.texts);
  }, [data]);

  return {
    texts,
    textsCount: data?.pages[0]?.textsCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetTexts;
