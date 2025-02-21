import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

const useGetCards = ({ enabled = true, query = "" }) => {
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
    queryKey: query ? ["cards", query] : ["cards"],
    queryFn: async ({ signal, pageParam, meta }) => {
      const cards = await axios.get(
        `card/?page=${pageParam}&searchQuery=${query || ""}`,
        { signal }
      );

      if (cards.data) return cards.data as GetCardsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage?.nextPage;
    },
  });

  let userCards = useMemo(() => {
    return data?.pages.flatMap((page) => (page as GetCardsResponse).cards);
  }, [data]);

  return {
    userCards: userCards,
    cardsCount: data?.pages[0]?.cardsCount,
    fetchNextPage,
    isIntialLoading,
    refetch,
    isFetchingNextPage,
  };
};

export default useGetCards;
