import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

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

export const useGetCards = ({ enabled = true, query = "" }) => {
  const {
    data,
    fetchNextPage,
    isLoading: isIntialLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: query ? ["cards", query] : ["cards"],
    queryFn: async ({ signal, pageParam, meta }) => {
      try {
        const cards = await axios.get(
          `card/?page=${pageParam}&searchQuery=${query || ""}`,
          { signal }
        );
        return cards.data as GetCardsResponse;
      } catch (error) {
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      return lastPage.nextPage;
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
