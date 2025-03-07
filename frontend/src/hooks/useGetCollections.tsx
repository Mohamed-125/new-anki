import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo } from "react";
import axios from "axios";
import { CardType } from "./useGetCards";

export type CollectionType = {
  collectionCards: CardType[];
  subCollections: CollectionType[];
  parentCollectionId?: string;
  id: string;
  name: string;
  slug: string;
  userId: string;
  public: boolean;
  childCollectionId: string;
  _id: string;
};

type GetCollectionsResponse = {
  collections: CollectionType[];
  parentCollections: CollectionType[];
  subCollections: CollectionType[];
  notParentCollections: CollectionType[];
  nextPage: number;
};

const useGetCollections = ({
  publicCollections,
  query,
  enabled = true,
}: {
  publicCollections?: boolean;
  query?: string;
  enabled?: boolean;
} = {}) => {
  let queryKey = ["collections"];

  if (publicCollections) {
    queryKey.push("public");
    if (query) {
      queryKey.push(query);
    }
  } else if (query) {
    queryKey.push(query);
  }

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

  const parentCollections = useMemo(() => {
    return data?.pages.flatMap((page) => page.parentCollections);
  }, [data]);

  const subCollections = useMemo(() => {
    return data?.pages.flatMap((page) => page.subCollections);
  }, [data]);

  const notParentCollections = useMemo(() => {
    return data?.pages.flatMap((page) => page.notParentCollections);
  }, [data]);

  return {
    collections,
    isLoading,
    isError,
    parentCollections,
    subCollections,
    notParentCollections,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export default useGetCollections;
