import axios from "axios";
import { useQuery } from "@tanstack/react-query";
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
  const { isOnline } = useNetwork();

  // always call hooks top-level
  const storedUserId = localStorage.getItem("userId");
  const { getUser, saveUser } = useDb(storedUserId || undefined);

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["me"],
    queryFn: async () => {
      console.log("fetching the user");
      // If offline, load cached user only — never call axios
      if (!isOnline) {
        const cached = await getUser();
        if (cached) return cached;
        throw new Error("Offline and no cached user data");
      }

      // Online fetch
      const { data } = await axios.get("/auth/me");
      const userData = data as UserType;

      if (userData?._id) {
        await saveUser(userData);
        localStorage.setItem("userId", userData._id);
      }

      return userData;
    },
    enabled: isOnline || !!storedUserId, // ✅ only run when online or we already have cached user
    retry: false, // ✅ never retry when offline
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 min
  });

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
