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
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  isLoading: boolean;
};

export const userContext = createContext<ContextType | null>(null);

const UserContext = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      axios
        .get("auth/me")
        .then((res) => {
          setUser(res.data);
          return res.data;
        })
        .catch(() => {
          setUser(null);
          return null;
        }),
    staleTime: 0, // Data is always considered stale
    refetchOnWindowFocus: false,
  });

  return (
    <userContext.Provider value={{ user, setUser, isLoading }}>
      {isLoading ? <Loading /> : children}
    </userContext.Provider>
  );
};

export default UserContext;
