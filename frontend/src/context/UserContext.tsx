import axios from "axios";
import React, { createContext, useState } from "react";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";

type UserType = {
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

  ("context ran");
  const { isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      console.log("fetcing");
      try {
        const res = await axios.get("auth/me");
        const data = res.data;
        setUser(data);
        return data;
      } catch (err) {
        setUser(null);
        return "error";
      }
    },
  });

  return (
    <userContext.Provider value={{ user, setUser, isLoading }}>
      {isLoading ? <Loading /> : children}
    </userContext.Provider>
  );
};

export default UserContext;
