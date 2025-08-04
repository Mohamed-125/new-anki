import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";

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
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get("auth/me");
      return data as UserType;
    },
    refetchOnWindowFocus: false,
  });

  // Language state is now managed by LanguageContext

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
