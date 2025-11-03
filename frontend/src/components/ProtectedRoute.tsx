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
  const { getUser } = useDb(user?._id || "");

  const [localUser, setLocalUser] = useState<any>(null);
  const [checkingLocalUser, setCheckingLocalUser] = useState(true);

  useEffect(() => {
    const checkLocalUser = async () => {
      if (!isOnline) {
        const offlineUser = await getUser();
        setLocalUser(offlineUser);
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
  }, [
    isOnline,
    user,
    localUser,
    isLoading,
    checkingLocalUser,
    navigate,
    location.pathname,
  ]);

  // ⏳ Wait while checking offline user
  if (isLoading || checkingLocalUser) return null;

  // 🧩 Offline fallback logic
  if (
    !isOnline &&
    (!localUser || !ALLOWED_OFFLINE_PATHS.includes(location.pathname))
  ) {
    return <OfflineFallback />;
  }

  // ✅ Allow rendering for:
  // - logged in user (online)
  // - offline user with local data on allowed pages
  if (
    user ||
    (localUser && ALLOWED_OFFLINE_PATHS.includes(location.pathname))
  ) {
    return <>{children}</>;
  }

  // default fallback
  return <OfflineFallback />;
};

export default ProtectedRoute;
