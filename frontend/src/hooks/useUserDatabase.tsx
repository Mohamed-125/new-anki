import { useEffect } from "react";
import useGetCurrentUser from "./useGetCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import useDb from "../db/useDb";

const useUserDatabase = () => {
  const { user } = useGetCurrentUser();
  const queryClient = useQueryClient();
  const { getUserDatabase, deleteUser } = useDb(user?._id || "");

  useEffect(() => {
    console.log("user", user);
    if (user?._id) {
      // Initialize the user's database only when we have a valid user ID
      getUserDatabase(user._id);
    }
  }, [user?._id]);

  const clearUserData = async () => {
    if (user?._id) {
      // Delete all user data from IndexedDB
      await deleteUser();
      // Clear React Query cache
      queryClient.clear();
      // Clear any other user-related data from localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("selectedLearningLanguage");
      localStorage.removeItem("unsyncedCards");
    }
  };

  return {
    clearUserData,
  };
};

export default useUserDatabase;
