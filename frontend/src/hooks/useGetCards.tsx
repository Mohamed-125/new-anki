import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNetwork } from "@/context/NetworkStatusContext";
import useGetCurrentUser from "./useGetCurrentUser";
import { useEffect, useMemo, useState } from "react";
import useDb from "../db/useDb";

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
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: Date | number;
  due: Date | number;
  language: string;
  createdAt: number;
  reviewCount?: number;
  // Added for offline sorting, assuming this exists on the backend model
  order?: number;
};

interface UseGetCardsProps {
  enabled?: boolean;
  query?: string;
  collectionId?: string;
  videoId?: string;
  study?: string;
  difficultyFilter?: string;
  srsMode?: boolean;
}

const useGetCards = ({
  enabled = true,
  query,
  collectionId,
  videoId,
  study,
  difficultyFilter,
  srsMode,
}: UseGetCardsProps = {}) => {
  const { selectedLearningLanguage, user } = useGetCurrentUser();
  const { isOnline } = useNetwork();
  const { getCards, bulkPutCards, clearCards } = useDb(user?._id);

  const queryKey = useMemo(() => {
    const key = ["cards", user?._id];
    if (study) key.push("study");
    if (query) key.push(query);
    else if (collectionId) key.push(collectionId);
    else if (videoId) key.push(videoId);
    else if (difficultyFilter) key.push(difficultyFilter);
    if (selectedLearningLanguage) key.push(selectedLearningLanguage);
    return key;
  }, [
    user?._id,
    study,
    query,
    collectionId,
    videoId,
    difficultyFilter,
    selectedLearningLanguage,
  ]);

  /**
   * Client-side filtering and sorting for OFFLINE mode,
   * mirroring backend logic (order: 1, createdAt: -1 OR due: 1, createdAt: 1, difficulty: 1, _id: 1)
   */
  const filterCards = (cards: CardType[], currentStudy?: string) => {
    // If online, we don't filter/sort on the client; we trust the server response.
    if (isOnline) return cards;

    let filtered = cards;

    // --- 1. Filtering Logic (Mirroring Backend) ---

    // Filter by Collection ID
    if (collectionId) {
      filtered = filtered.filter((c) => c.collectionId === collectionId);
    }

    // Filter by Search Query (front field only, as per original logic)
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((c) =>
        c.front.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by Difficulty Ranges (Mirroring Backend's easeFactor logic)
    if (difficultyFilter && difficultyFilter !== "all") {
      filtered = filtered.filter((c) => {
        switch (difficultyFilter) {
          case "easy":
            return c.difficulty >= 0.7;
          case "medium":
            return c.difficulty >= 0.5 && c.difficulty < 0.7;
          case "hard":
            return c.difficulty < 0.5;
          default:
            return true;
        }
      });
    }

    // Filter for Study Mode ('today' only)
    if (currentStudy?.toLowerCase() === "today") {
      const endOfToday = new Date();
      // Set to 11:59:59 PM today
      endOfToday.setHours(23, 59, 59, 999);
      const endOfTodayTime = endOfToday.getTime();

      // Only include cards due today or earlier
      filtered = filtered.filter(
        (c) => new Date(c.due).getTime() <= endOfTodayTime
      );
    }

    const compareIds = (a: string, b: string) => {
      const regex = /^(\D*)(\d*)$/;
      const [aText, aNum] = a
        .match(regex)
        ?.slice(1, 3)
        .map((x) => x || "") || ["", "0"];
      const [bText, bNum] = b
        .match(regex)
        ?.slice(1, 3)
        .map((x) => x || "") || ["", "0"];

      const textDiff = aText.localeCompare(bText);
      if (textDiff !== 0) return textDiff;

      return Number(aNum) - Number(bNum);
    };

    if (currentStudy) {
      filtered.sort((a, b) => {
        const getTimeSafe = (date: any) =>
          date ? new Date(date).getTime() : Infinity;
        const getDifficulty = (d: any) => (d != null ? Number(d) : Infinity);

        // 1. Compare due
        const dueDiff = getTimeSafe(a.due) - getTimeSafe(b.due);
        if (dueDiff !== 0) return dueDiff;

        // 2. Compare createdAt
        const createdDiff = getTimeSafe(a.createdAt) - getTimeSafe(b.createdAt);
        if (createdDiff !== 0) return createdDiff;

        // 3. Compare difficulty
        const difficultyDiff =
          getDifficulty(a.difficulty) - getDifficulty(b.difficulty);
        if (difficultyDiff !== 0) return difficultyDiff;

        // 4. Compare _id naturally for custom IDs
        return compareIds(a._id, b._id);
      });
    }

    return filtered;
  };

  const {
    data,
    isFetching,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    enabled: enabled && !!user && isOnline,
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error("User not found");

      let url = `card/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;
      if (collectionId) url += `&collectionId=${collectionId}`;
      if (videoId) url += `&videoId=${videoId}`;
      if (study) url += `&study=${study}`;
      if (srsMode) url += `&srsMode=true`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;
      if (difficultyFilter && difficultyFilter !== "all")
        url += `&difficulty=${difficultyFilter}`;

      const { data } = await axios.get(url);
      const serverCards: CardType[] = data.cards ?? [];

      return {
        // filterCards returns serverCards immediately because isOnline is true here
        cards: filterCards(serverCards),
        cardsCount: data.cardsCount,
        nextPage: data.nextPage ?? null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5,
    initialPageParam: 0,
  });

  // ✅ Automatically fetch all pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !study) {
      const timer = setTimeout(() => fetchNextPage(), 200);
      return () => clearTimeout(timer);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, study]);

  const [userCards, setUserCards] = useState<CardType[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      if (isOnline) {
        // Online: get all flattened cards from query pages
        const cards = data?.pages?.flatMap((p) => p.cards) ?? [];
        setUserCards(cards);
      } else {
        // Offline: get all cards from Dexie
        const offlineCards = await getCards();

        console.log("offlineCards", offlineCards);
        if (!offlineCards) return setUserCards([]);

        // Apply client-side filters and sorting, passing 'study'
        const filteredCards = filterCards(offlineCards, study);
        console.log("filteredCards ", filteredCards);
        setUserCards(filteredCards);
      }
    };

    fetchCards();
  }, [data?.pages, isOnline, study]); // Added 'study' to dependencies

  // Synchronization logic for Dexie (using the stable/debounced logic)
  useEffect(() => {
    // 1. Only sync when online and user is available
    if (!isOnline || !user || study) return;

    // 2. Determine when to sync:
    //    Sync when all non-study data is loaded (!hasNextPage),
    //    OR if in study mode (where we usually only fetch one page).
    const allPagesLoaded = !hasNextPage && !isFetchingNextPage;
    const shouldSync = allPagesLoaded;

    if (userCards.length > 0 && shouldSync) {
      const syncToDexie = async () => {
        // Clear and Write in a single, sequential block
        console.log("Syncing", userCards.length, "cards to Dexie...");
        await clearCards();
        await bulkPutCards(userCards);
        console.log("Sync Complete.");
      };

      // Use a small timeout to let rapid updates settle, acting as a debouncer.
      const syncTimer = setTimeout(syncToDexie, 100);

      return () => clearTimeout(syncTimer);
    }
  }, [
    userCards,
    isOnline,
    user,
    hasNextPage,
    isFetchingNextPage,
    study,
    clearCards,
    bulkPutCards,
  ]);

  return {
    userCards,
    cardsCount: isOnline
      ? data?.pages?.[0]?.cardsCount ?? 0
      : userCards?.length ?? 0,
    isFetching,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  };
};

export default useGetCards;
