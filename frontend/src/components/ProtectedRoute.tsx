import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useDb from "../db/useDb";
import { useNetwork } from "../context/NetworkStatusContext";
import OfflineFallback from "./OfflineFallback";

const ALLOWED_OFFLINE_PATHS = ["/", "/study"];

const ProtectedRoute = ({
  children,
  protectOffline = true,
}: {
  children: React.ReactNode;
  protectOffline?: boolean;
}) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { getUser } = useDb(user?._id);

  const [localUser, setLocalUser] = useState<any>(null);
  const [checkingLocalUser, setCheckingLocalUser] = useState(true);

  useEffect(() => {
    const checkLocalUser = async () => {
      if (!isOnline) {
        // Try to get user ID from localStorage if not available from online state
        const storedUserId = localStorage.getItem("userId");
        const db = storedUserId ? useDb(storedUserId) : null;
        if (db) {
          const offlineUser = await db.getUser();
          setLocalUser(offlineUser);
        }
      } else {
        setLocalUser(null);
      }
      setCheckingLocalUser(false);
    };

    checkLocalUser();
  }, [isOnline, getUser]);

  useEffect(() => {
    if (isLoading || checkingLocalUser) return;

    // 🟢 ONLINE: check normal login
    if (isOnline) {
      if (!user) {
        sessionStorage.setItem("redirectPath", location.pathname);
        navigate("/login");
      } else if (!user.languages?.length) {
        navigate("/user-profile");
      }
      return;
    }

    // 🔴 OFFLINE: check if we have local user data
    if (!isOnline && !localUser && !ALLOWED_OFFLINE_PATHS.includes(location.pathname)) {
      navigate("/login");
    }
  }, [
    isOnline,
    user,
    localUser,
    isLoading,
    checkingLocalUser,
    navigate,
    location.pathname,
  ]);

  // ⏳ Wait while checking user status
  if (isLoading || checkingLocalUser) return null;

  // ✅ Allow access if:
  // 1. User is online and authenticated
  // 2. User is offline but has local data and accessing allowed paths
  if (
    (isOnline && user) ||
    (!isOnline && localUser && ALLOWED_OFFLINE_PATHS.includes(location.pathname))
  ) {
    return <>{children}</>;
  }

  // 🚫 Show offline fallback for non-allowed paths when offline
  if (!isOnline && !ALLOWED_OFFLINE_PATHS.includes(location.pathname)) {
    return <OfflineFallback />;
  }

  // Default: redirect to login
  navigate("/login");
  return null;
};

export default ProtectedRoute;
