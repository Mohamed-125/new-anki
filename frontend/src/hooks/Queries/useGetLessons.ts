import { LessonType } from "./useLessonMutations";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type GetLessonsResponse = {
  lessons: LessonType[];
  nextPage: number;
  lessonsCount: number;
};

const useGetLessons = ({
  courseLevelId,
  query,
  enabled = true,
}: {
  courseLevelId: string;
  query?: string;
  enabled?: boolean;
}) => {
  const queryKey = ["courseLevelLessons", courseLevelId];

  const queryClient = useQueryClient();

  if (query) queryKey.push(query);

  console.log(
    queryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey)
  );
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
      console.log("raaan");
      let url = `lesson?courseLevelId=${courseLevelId}`;

      const response = await axios.get(url, { signal });
      return response.data as GetLessonsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const lessons = data?.pages.flatMap((page) => page?.lessons);

  return {
    lessons,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    lessonsCount: data?.pages?.[0]?.lessonsCount,
  };
};

export default useGetLessons;
