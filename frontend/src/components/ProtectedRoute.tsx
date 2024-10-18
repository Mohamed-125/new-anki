import React, { useContext, useEffect } from "react";
import { userContext } from "../context/UserContext";
import { Navigate, useNavigate } from "react-router-dom";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("user", user);
    console.log("isLoading", isLoading);
    if (!isLoading) {
      if (!user) navigate("/login");
    }
  }, [user, isLoading]);

  return <>{user && children}</>;
};

export default ProtectedRoute;
