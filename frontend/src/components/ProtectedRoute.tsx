import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useDb from "../db/useDb";
import { useNetwork } from "../context/NetworkStatusContext";
import OfflineFallback from "./OfflineFallback";

const ProtectedRoute = ({ children, protectOffline = true }: { children: React.ReactNode , protectOffline?:boolean}) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { getCards } = useDb(user?._id);

  const [hasOfflineData, setHasOfflineData] = useState(false);

  useEffect(() => {
    const checkOfflineData = async () => {
      // Only check offline data if user is offline and not logged in
      if (!isOnline && !user?._id) {
        const cards = await getCards();
        setHasOfflineData(!!cards?.length);
      }
    };

    checkOfflineData();
  }, [isOnline, user?._id, getCards]);

  useEffect(() => {
    if (isLoading) return;

    // If user is online but not logged in → redirect to login
    if (isOnline && !user) {
      sessionStorage.setItem("redirectPath", location.pathname);
      navigate("/login");
    }

    // Example of conditional redirect to user-profile if needed later
    else if (!user?.languages?.length) {
      navigate("/user-profile");
    }
  }, [isOnline, user, isLoading, navigate, location]);

  // If offline and no user and no offline data → show fallback
  if (!isOnline && !user && !hasOfflineData && !protectOffline) {
    return <OfflineFallback />;
  }

  // If user is logged in → render protected content
  return <>{user && children}</>;
};

export default ProtectedRoute;
