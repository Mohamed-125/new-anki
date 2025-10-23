import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNetwork } from "@/context/NetworkStatusContext";
import useDb from "../db/useDb";
import useGetCurrentUser from "./useGetCurrentUser";

export type CardType = {
  _id: string;
  front: string;
  back: string;
  content?: string;
  collectionId?: string;
  userId?: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  language: string;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: number;
  due: number;
  createdAt: number;
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
  srsMode,
}: {
  enabled?: boolean;
  query?: string;
  collectionId?: string;
  videoId?: string;
  study?: string;
  difficultyFilter?: string;
  srsMode?: boolean;
} = {}) => {
  const { selectedLearningLanguage, user } = useGetCurrentUser();
  const { isOnline } = useNetwork();
  const queryKey: any[] = ["cards", user?._id];
  if (study) queryKey.push("study");
  if (query) queryKey.push(query);
  else if (collectionId) queryKey.push(collectionId);
  else if (videoId) queryKey.push(videoId);
  else if (difficultyFilter) queryKey.push(difficultyFilter);
  if (selectedLearningLanguage) queryKey.push(selectedLearningLanguage);

  const filterCards = (cards: CardType[]) => {
    let filteredCards = cards;
    if (collectionId) {
      filteredCards = filteredCards.filter(
        (c) => c.collectionId === collectionId
      );
    }
    if (query) {
      filteredCards = filteredCards.filter((c) =>
        c.front.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (difficultyFilter && difficultyFilter !== "all") {
      filteredCards = filteredCards.filter(
        (c) => String(c.difficulty) === difficultyFilter
      );
    }
    return filteredCards;
  };

  const paginateCards = (cards: CardType[], pageParam: number) => {
    const pageSize = 30;
    const start = pageParam * pageSize;
    const end = start + pageSize;
    const pageCards = cards.slice(start, end);

    return {
      cards: pageCards,
      cardsCount: cards.length,
      nextPage: end < cards.length ? pageParam + 1 : undefined,
      allCards: cards,
    } as GetCardsResponse;
  };

  const { addCard, getCards: getDexieCards } = useDb(user?._id);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    status,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      // Offline mode: fetch from Dexie
      console.log("isOnline", isOnline);

      if (!isOnline) {
        const allCards = await getDexieCards();
        const filteredCards = filterCards(allCards);
        return paginateCards(filteredCards, pageParam);
      }

      try {
        // Online mode: try server first
        let url = `card/?page=${pageParam}`;
        if (query) url += `&searchQuery=${query}`;
        if (collectionId) url += `&collectionId=${collectionId}`;
        if (videoId) url += `&videoId=${videoId}`;
        if (study) url += `&study=${study}`;
        if (srsMode) url += `&srsMode=true`;
        if (selectedLearningLanguage)
          url += `&language=${selectedLearningLanguage}`;
        if (difficultyFilter && difficultyFilter !== "all") {
          url += `&difficulty=${difficultyFilter}`;
        }

        const res = await axios.get(url);
        return res.data as GetCardsResponse;
      } catch (error) {
        // If server request fails and we have local data, use it
        if (user) {
          const allCards = await getDexieCards();
          if (!allCards) return [];
          const filteredCards = filterCards(allCards);
          return paginateCards(filteredCards, pageParam);
        }
        throw error; // Re-throw if we don't have local data
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const userCards = data?.pages.flatMap((page) => page.cards) ?? [];

  return {
    userCards,
    cardsCount: data?.pages[0]?.cardsCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    // allCards: data?.pages[0]?.allCards,
  };
};

export default useGetCards;
