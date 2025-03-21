import React, { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    if (!isLoading) {
      if (!user) {
        console.log("protected route worked");
        navigate("/login");
      }
    }
  }, [user, isLoading]);

  return <>{user && children}</>;
};

export default ProtectedRoute;
