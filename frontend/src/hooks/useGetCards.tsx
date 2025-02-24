import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

export type CardType = {
  _id: string;
  front: string;
  back: string;
  content?: string;
  collectionId?: string;
  userId?: string;
  easeFactor?: number;
};

type GetCardsResponse = {
  cards: CardType[];
  cardsCount: number;
  nextPage: number;
};

const useGetCards = ({
  enabled = true,
  query,
  collectionId,
  videoId,
  study,
}: {
  enabled?: boolean;
  query?: string;
  collectionId?: string;
  videoId?: string;
  study?: boolean;
} = {}) => {
  let queryKey = query
    ? ["cards", query]
    : collectionId
    ? study
      ? ["cards", "study", collectionId]
      : ["cards", collectionId]
    : videoId
    ? ["cards", videoId]
    : study
    ? ["cards", "study"]
    : ["cards"];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isIntialLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam, meta }) => {
      let url = `card/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (collectionId) url += `&collectionId=${collectionId}`;
      if (videoId) url += `&videoId=${videoId}`;
      if (study) url += `&study=true`;

      const cards = await axios.get(url, { signal });

      if (cards.data) return cards.data as GetCardsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage?.nextPage;
    },
    enabled: enabled,
  });

  let userCards = useMemo(() => {
    return data?.pages.flatMap((page) => (page as GetCardsResponse).cards);
  }, [data]);

  const queryClient = useQueryClient();

  return {
    userCards: userCards,
    cardsCount: data?.pages[0]?.cardsCount,
    fetchNextPage,
    isIntialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetCards;
