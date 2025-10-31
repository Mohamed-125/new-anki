import {
  QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useNetwork } from "@/context/NetworkStatusContext";
import useGetCurrentUser from "./useGetCurrentUser";
import { useEffect, useMemo, useState } from "react";
import useDb from "../db/useDb";
import { useLocation } from "react-router-dom";

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
  createdAt: number | string;
  reviewCount?: number;
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
  searchSidebar?: boolean;
}

const useGetCards = ({
  enabled = true,
  query,
  collectionId,
  videoId,
  study,
  difficultyFilter,
  srsMode,
  searchSidebar,
}: UseGetCardsProps = {}) => {
  const { selectedLearningLanguage, user } = useGetCurrentUser();
  const { isOnline } = useNetwork();
  const { getCards, bulkPutCards, clearCards } = useDb(user?._id);

  const [userCards, setUserCards] = useState<CardType[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  const location = useLocation();

  const queryKey = useMemo(() => {
    const key = ["cards", user?._id];

    // --- Extract collection/subcollection IDs from the URL ---
    if (location?.pathname?.includes("collection")) {
      // Example: /collections/123/subcollections/456
      const matches = location.pathname.match(/collection[s]?\/(\w+)/g);

      console.log("matches", matches);
      if (matches) {
        matches.forEach((segment) => {
          const id = segment.split("/")[1];
          console.log("segment", segment);
          console.log("id", id);
          if (id) key.push(id);
        });
      }
    }

    // --- Add the usual filters ---
    if (study) key.push("study");
    if (query) key.push(query);
    if (collectionId) key.push(collectionId);
    if (videoId) key.push(videoId);
    if (difficultyFilter) key.push(difficultyFilter);
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
    location.pathname, // <-- include this dependency
  ]);
  /**
   * Client-side filtering and sorting for OFFLINE mode.
   */
  const filterCards = (cards: CardType[], currentStudy?: string) => {
    if (isOnline) return cards;

    let filtered = cards;

    // --- Filtering ---
    if (collectionId) {
      filtered = filtered.filter((c) => c.collectionId === collectionId);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((c) =>
        c.front.toLowerCase().includes(lowerQuery)
      );
    }

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

    if (currentStudy?.toLowerCase() === "today") {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const endOfTodayTime = endOfToday.getTime();
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

    const getTimeSafe = (date: any) =>
      date ? new Date(date).getTime() : Infinity;

    if (currentStudy) {
      filtered.sort((a, b) => {
        const getDifficulty = (d: any) => (d != null ? Number(d) : Infinity);
        const dueDiff = getTimeSafe(a.due) - getTimeSafe(b.due);
        if (dueDiff !== 0) return dueDiff;

        const createdDiff = getTimeSafe(a.createdAt) - getTimeSafe(b.createdAt);
        if (createdDiff !== 0) return createdDiff;

        const difficultyDiff =
          getDifficulty(a.difficulty) - getDifficulty(b.difficulty);
        if (difficultyDiff !== 0) return difficultyDiff;

        return compareIds(a._id, b._id);
      });
    } else {
      console.log("filtering the same as the offline");
      filtered.sort((a, b) => {
        const aTime =
          typeof a.createdAt === "number"
            ? a.createdAt
            : new Date(a.createdAt).getTime();
        const bTime =
          typeof b.createdAt === "number"
            ? b.createdAt
            : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

      // filtered.sort((a, b) => {
      //   const createdDiff = getTimeSafe(b.createdAt) - getTimeSafe(a.createdAt);
      //   if (createdDiff !== 0) return createdDiff;
      //   return compareIds(a._id, b._id);
      // });
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
        cards: filterCards(serverCards),
        cardsCount: data.cardsCount,
        nextPage: data.nextPage ?? null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: location.pathname.includes("collection") ? 0 : 1000 * 60 * 5, // 👈 disable cache for collections
    cacheTime: location.pathname.includes("collection") ? 0 : 1000 * 60 * 10, // 👈 don't keep cache for collections
    refetchOnMount: location.pathname.includes("collection"), // 👈 always refetch if in collection
    refetchOnWindowFocus: location.pathname.includes("collection"), // 👈 optional
    initialPageParam: 0,
  });
  // ✅ Automatically fetch all pages (skip during search)
  useEffect(() => {
    if (query) return; // 🚫 Skip auto-fetch when searching
    if (hasNextPage && !isFetchingNextPage && !study && !collectionId && !searchSidebar) {
      const timer = setTimeout(() => fetchNextPage(), 200);
      return () => clearTimeout(timer);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, study, query]);

  // ✅ Load user cards (online or offline)
  useEffect(() => {
    const fetchCards = async () => {
      if (isOnline) {
        const cards = data?.pages?.flatMap((p) => p.cards) ?? [];
        setUserCards(cards);
      } else {
        const offlineCards = await getCards();
        if (!offlineCards) return setUserCards([]);
        const filteredCards = filterCards(offlineCards, study);
        setUserCards(filteredCards);
      }
    };
    fetchCards();
  }, [data?.pages, isOnline, study]);

  // ✅ Sync Dexie (only on first full load, skip search & study)
  useEffect(() => {
    if (!isOnline || !user || study || query || hasSynced) return;

    const allPagesLoaded = !hasNextPage && !isFetchingNextPage;
    if (userCards.length > 0 && allPagesLoaded) {
      const syncToDexie = async () => {
        console.log("Syncing", userCards.length, "cards to Dexie...");
        await clearCards();
        await bulkPutCards(userCards);
        console.log("Sync Complete.");
        setHasSynced(true); // ✅ prevent re-syncing
      };

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
    query,
    hasSynced,
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
