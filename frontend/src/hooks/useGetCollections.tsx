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
}: {
  publicCollections?: boolean;
} = {}) => {
  const {
    data: collections,
    isLoading,
    isError,
  } = useQuery({
    queryKey: publicCollections ? ["collections", "public"] : ["collections"],
    queryFn: ({ signal }) =>
      axios
        .get(publicCollections ? "collection/public" : "collection", { signal })
        .then((res) => res.data as CollectionType[]),
  });

  const subCollections = useMemo(
    () => collections?.filter((collection) => collection.parentCollectionId),
    [collections]
  );

  const parentCollections = useMemo(
    () =>
      collections?.filter((parentCollection) =>
        subCollections?.some(
          (subCollection) =>
            subCollection.parentCollectionId === parentCollection._id
        )
      ),
    [collections, subCollections]
  );

  const notParentCollections = useMemo(
    () => collections?.filter((collection) => !collection.parentCollectionId),
    [collections]
  );

  return {
    collections,
    isLoading,
    isError,
    parentCollections,
    subCollections,
    notParentCollections,
  };
};

export default useGetCollections;
