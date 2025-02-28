import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  _id: string;
};

const useGetCollections = ({
  publicCollections,
  query,
}: {
  publicCollections?: boolean;
  query?: string;
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

  let url = `collection/`;

  if (query) url += `?searchQuery=${query}`;
  if (publicCollections) url += `&public=${true}`;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: ({ signal }) => axios.get(url, { signal }).then((res) => res.data),
  });

  return {
    collections: data?.collections as CollectionType[],
    isLoading,
    isError,
    parentCollections: data?.parentCollections as CollectionType[],
    subCollections: data?.subCollections as CollectionType[],
    notParentCollections: data?.notParentCollections as CollectionType[],
  };
};

export default useGetCollections;
