import { useQuery } from "@tanstack/react-query";
import React from "react";
import { CardType } from "./useGetCards";
import axios from "axios";
import Loading from "../components/Loading";
import { CollectionType } from "../context/CollectionsContext";

const useGetCollections = ({
  publicCollections,
}: {
  publicCollections?: boolean;
} = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: publicCollections ? ["collections", "public"] : ["collections"],
    queryFn: ({ signal }) =>
      axios
        .get(publicCollections ? "collection/public" : "collection", { signal })
        .then((res) => res.data as CollectionType[]),
  });

  return { data, isLoading, isError };
};

export default useGetCollections;
