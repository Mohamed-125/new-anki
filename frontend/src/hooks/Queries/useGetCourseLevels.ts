import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { courseLevelType } from "./useCourseLevelMutations";

type GetCourseLevelsResponse = {
  courseLevels: courseLevelType[];
  nextPage: number;
  courseLevelsCount: number;
};

const useGetCourseLevels = ({
  courseId,
  query,
  enabled = true,
}: {
  courseId: string;
  query?: string;
  enabled?: boolean;
}) => {
  console.log(courseId);
  const queryKey = ["courseLevel", courseId];
  if (query) queryKey.push(query);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      let url = `courseLevel?courseId=${courseId}&page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;

      const response = await axios.get(url, { signal });
      return response.data as GetCourseLevelsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const courseLevels = useMemo(
    () => data?.pages.flatMap((page) => page.courseLevels || []),
    [data]
  );

  return {
    courseLevels,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    courseLevelsCount: data?.pages[0].courseLevelsCount,
  };
};

export default useGetCourseLevels;
