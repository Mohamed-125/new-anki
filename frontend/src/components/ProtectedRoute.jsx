import React, { useContext, useEffect } from "react";
import { userContext } from "../context/UserContext";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, setUser, isLoading } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate("/login");
    }
  }, [user]);

  return <>{user && children}</>;
};

export default ProtectedRoute;
