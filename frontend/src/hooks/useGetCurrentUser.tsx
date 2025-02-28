import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
export type UserType = {
  email: string;
  _id: string;
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

  return { user, isLoading };
};

export default useGetCurrentUser;
