import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import useGetCurrentUser from "./useGetCurrentUser";

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
  difficultyFilter,
}: {
  enabled?: boolean;
  query?: string;
  collectionId?: string;
  videoId?: string;
  study?: boolean;
  difficultyFilter?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey: any[] = ["cards"];

  if (study) {
    queryKey.push("study");
  }

  if (query) {
    queryKey.push(query);
  } else if (collectionId) {
    queryKey.push(collectionId);
  } else if (videoId) {
    queryKey.push(videoId);
  } else if (difficultyFilter) {
    queryKey.push(difficultyFilter);
  }

  if (selectedLearningLanguage) {
    queryKey.push(selectedLearningLanguage);
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isIntialLoading,
    isFetchingNextPage,
    status,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam, meta }) => {
      let url = `card/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (collectionId) url += `&collectionId=${collectionId}`;
      if (videoId) url += `&videoId=${videoId}`;
      if (study) url += `&study=true`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

      // Add difficulty filter parameter if provided
      if (difficultyFilter && difficultyFilter !== "all") {
        url += `&difficulty=${difficultyFilter}`;
      }

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
    return data?.pages.flatMap(
      (page) => (page as GetCardsResponse).cards ?? []
    );
  }, [data]);

  console.log("data", data);

  return {
    userCards,
    cardsCount: data?.pages[0]?.cardsCount,
    fetchNextPage,
    isIntialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    allCards: data?.pages[0]?.allCards,
  };
};

export default useGetCards;
