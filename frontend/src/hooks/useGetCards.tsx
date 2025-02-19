import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

export type CardType = {
  _id: string;
  front: string;
  back: string;
  content?: string;
  collectionId?: string;
  userId?: string;
  easeFactor?: number;
};

const useGetCards = (enabled = true) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cards"],
    refetchOnWindowFocus: false,
    queryFn: () => axios.get("card").then((res) => res.data),
    // enabled,
  });

  return { data, isLoading, isError };
};

export default useGetCards;
