import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

export type CardType = {
  _id: string;
  front: string;
  back: string;
  content?: string;
  collectionId?: string;
};

const useGetCards = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cards"],
    queryFn: () => axios.get("card").then((res) => res.data),
  });

  return { data, isLoading, isError };
};

export default useGetCards;
