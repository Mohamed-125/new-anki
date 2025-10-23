import React, { useContext, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("proteceted");
        // Store the current location before redirecting
        sessionStorage.setItem("redirectPath", location.pathname);
        navigate("/login");
      }
      // else if (!user?.languages || user?.languages?.length === 0) {
      //   // Only redirect to user-profile if they haven't set their language
      //   navigate("/user-profile");
      // }
    }
  }, [user, isLoading, location]);

  return <>{user && children}</>;
};

export default ProtectedRoute;
