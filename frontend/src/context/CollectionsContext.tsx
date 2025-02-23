import axios from "axios";
import React, { createContext, useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";
import useGetCollections from "../hooks/useGetCollections";
import { CardType } from "../hooks/useGetCards";
import Collections from "../pages/Collections";

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

type CollectionsContextType = {
  collections: CollectionType[] | undefined;
  isLoading: boolean;
  parentCollections: CollectionType[] | undefined;
  subCollections: CollectionType[] | undefined;
  notParentCollections: CollectionType[] | undefined;
};

export const collectionsContext = createContext<CollectionsContextType | null>(
  null
);

const CollectionsContext = ({ children }: { children: React.ReactNode }) => {
  // const [collections, setCollections] = useState<CollectionType[] | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      console.log("fetching collectioen from colllection context ");
      return axios
        .get("collection")
        .then((res) => res.data as CollectionType[]);
    },
  });

  const subCollections = useMemo(
    () => data?.filter((collection) => collection.parentCollectionId),
    [data]
  );

  const parentCollections = useMemo(
    () =>
      data?.filter((parentCollection) =>
        subCollections?.some(
          (subCollection) =>
            subCollection.parentCollectionId === parentCollection._id
        )
      ),
    [data, subCollections]
  );

  const notParentCollections = useMemo(
    () => data?.filter((collection) => !collection.parentCollectionId),
    [data]
  );
  return (
    <collectionsContext.Provider
      value={{
        isLoading,
        collections: data,
        parentCollections,
        subCollections,
        notParentCollections,
      }}
    >
      {children}
    </collectionsContext.Provider>
  );
};

export default CollectionsContext;
