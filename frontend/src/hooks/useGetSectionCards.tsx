import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { CardType } from "./useGetCards";
import useGetCurrentUser from "./useGetCurrentUser";

type GetSectionCardsResponse = {
  cards: CardType[];
  cardsCount: number;
  nextPage: number;
};

const useGetSectionCards = ({
  enabled = true,
  query,
  sectionId,
}: {
  enabled?: boolean;
  query?: string;
  sectionId: string;
}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey = ["cards", "section", sectionId];

  if (query) {
    queryKey.push(query);
  }

  queryKey.push(selectedLearningLanguage);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      let url = `card/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (sectionId) url += `&sectionId=${sectionId}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

      const response = await axios.get(url, { signal });
      return response.data as GetSectionCardsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const cards = useMemo(() => {
    return data?.pages.flatMap((page) => page.cards);
  }, [data]);

  return {
    cards,
    cardsCount: data?.pages[0]?.cardsCount,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetSectionCards;
