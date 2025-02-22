import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";

export type UserType = {
  _id: string;
  email: string;
  password: string;
  collections: string[];
};

type ContextType = {
  user: UserType | null;
  isLoading: boolean;
};

export const userContext = createContext<ContextType | null>(null);

const UserContext = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      axios
        .get("auth/me")
        .then((res) => {
          return res.data;
        })
        .catch(() => {
          return null;
        }),
    staleTime: Infinity, // Data is always considered stale
    refetchOnWindowFocus: false,
  });

  return (
    <userContext.Provider value={{ user, isLoading }}>
      {isLoading ? <Loading /> : children}
    </userContext.Provider>
  );
};

export default UserContext;
