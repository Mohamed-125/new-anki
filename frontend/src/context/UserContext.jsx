import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import Loading from "../components/Loading";

export const userContext = createContext(null);

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    axios
      .get("auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, isLoading }}>
      {isLoading ? <Loading /> : children}
    </userContext.Provider>
  );
};

export default UserContext;
