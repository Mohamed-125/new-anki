import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo } from "react";
import axios from "axios";
import { CardType } from "./useGetCards";
import useGetCurrentUser from "./useGetCurrentUser";

export type CollectionType = {
  collectionCards: CardType[];
  subCollections: CollectionType[];
  parentCollectionId?: string;
  id: string;
  name: string;
  slug: string;
  userId: string;
  showCardsInHome: boolean;
  public: boolean;
  childCollectionId: string;
  _id: string;
  sectionId: string;
};

type GetCollectionsResponse = {
  collections: CollectionType[];
  nextPage: number;
  collectionsCount: number;
};

const useGetCollections = ({
  publicCollections,
  query,
  all = false,
  enabled = true,
  sectionId,
}: {
  publicCollections?: boolean;
  query?: string;
  enabled?: boolean;
  all?: boolean;
  sectionId?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();

  let queryKey = ["collections"];

  if (publicCollections) {
    queryKey.push("public");
  }
  if (query) {
    queryKey.push(query);
  } else if (all) {
    queryKey.push("all");
  }
  if (sectionId) {
    queryKey.push("section", sectionId);
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
      let url = `collection/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (publicCollections) url += `&public=${true}`;
      if (all) url += `&all=${true}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;
      if (sectionId) url += `&sectionId=${sectionId}`;

      const response = await axios.get(url, { signal });
      return response.data as GetCollectionsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const collections = useMemo(() => {
    return data?.pages.flatMap((page) => page.collections);
  }, [data]);

  return {
    collections,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    collectionsCount: data?.pages[0]?.collectionsCount,
  };
};

export default useGetCollections;
