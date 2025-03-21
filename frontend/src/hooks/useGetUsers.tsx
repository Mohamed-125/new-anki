import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import useGetCurrentUser from "./useGetCurrentUser";
import { UserType } from "./useGetCurrentUser";

type GetUsersResponse = {
  users: UserType[];
  usersCount: number;
  nextPage: number;
};

const useGetUsers = ({
  enabled = true,
  query,
  isAdmin,
  isPremium,
}: {
  enabled?: boolean;
  query?: string;
  isAdmin?: string;
  isPremium?: string;
} = {}) => {
  let queryKey = ["users"];

  if (query) {
    queryKey = ["users", query];
  }
  if (isAdmin !== undefined) {
    queryKey.push("admin", isAdmin || "all roles");
  }
  if (isPremium !== undefined) {
    queryKey.push("premium", isPremium || "all types");
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading: isInitialLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam, meta }) => {
      let url = `auth/users?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (isAdmin) url += `&isAdmin=${isAdmin}`;
      if (isPremium) url += `&isPremium=${isPremium}`;

      const response = await axios.get(url, { signal });

      if (response.data) return response.data as GetUsersResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage?.nextPage;
    },
    enabled: enabled,
  });

  let users = useMemo(() => {
    return data?.pages.flatMap((page) => (page as GetUsersResponse).users);
  }, [data]);

  const queryClient = useQueryClient();

  return {
    users,
    usersCount: data?.pages[0]?.usersCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetUsers;
