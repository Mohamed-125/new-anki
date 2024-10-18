import { useQuery } from "@tanstack/react-query";
import React from "react";
import { CardType } from "./useGetCards";
import axios from "axios";
import Loading from "../components/Loading";

export type CollectionType = {
  collectionCards: CardType[];
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
  const { data, isLoading, isError } = useQuery({
    queryKey: publicCollections ? ["collections", "public"] : ["collections"],
    queryFn: () =>
      axios
        .get(publicCollections ? "collection/public" : "collection")
        .then((res) => res.data as CollectionType[]),
  });

  if (isLoading) <Loading />;
  return { data, isLoading, isError };
};

export default useGetCollections;
