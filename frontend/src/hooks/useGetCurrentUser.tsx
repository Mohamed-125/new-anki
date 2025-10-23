import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { useNetwork } from "@/context/NetworkStatusContext";
import useDb from "../db/useDb";

export type UserType = {
  email: string;
  _id: string;
  languages: [string];
  proficiencyLevel: string;
  username: string;
  isPremium: boolean;
  isAdmin: boolean;
  streak: number;
  activeDays: number;
  lastLoginDate: string;
  translationLanguage: string;
};

const useGetCurrentUser = () => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        // If offline and we have a cached user, use it
        // if (!isOnline) {
        //   const userId = localStorage.getItem("userId");
        //   if (userId) {
        //     const cachedUser = await getUser();
        //     if (cachedUser) {
        //       return cachedUser;
        //     }
        //   }
        //   throw new Error("No cached user data available");
        // }

        // If online, fetch from server
        const { data } = await axios.get("auth/me");
        const userData = data as UserType;

        // Only save user data and create database if we have a valid user ID
        if (userData?._id) {
          await saveUser(userData);
          localStorage.setItem("userId", userData._id);
        }

        return userData;
      } catch (error) {
        // If online fetch fails, try to get from cache as fallback
        if (isOnline) {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const cachedUser = await getUser();
            if (cachedUser) {
              return cachedUser;
            }
          }
        }
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: isOnline ? 3 : 0, // Only retry if online
  });
  const { getUser, saveUser } = useDb(user?._id);

  const { selectedLearningLanguage, setSelectedLearningLanguage } =
    useGetSelectedLearningLanguage();

  return {
    user,
    isLoading,
    selectedLearningLanguage,
    setSelectedLearningLanguage,
  };
};

export default useGetCurrentUser;
