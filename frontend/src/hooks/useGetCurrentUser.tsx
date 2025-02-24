import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetCurrentUser = () => {
  type UserType = {
    email: string;
    _id: string;
  };
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get("auth/me");
      return data as UserType;
    },
    refetchOnWindowFocus: false,
  });

  return { user, isLoading };
};

export default useGetCurrentUser;
