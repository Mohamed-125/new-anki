import { LessonType } from "./useLessonMutations";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

type GetLessonsResponse = {
  lessons: LessonType[];
  nextPage: number;
  lessonsCount: number;
};

const useGetLessons = ({
  courseLevelId,
  query,
  lessonType,
  enabled = true,
}: {
  courseLevelId?: string;
  query?: string;
  lessonType?: "lesson" | "revision" | "exam" | "grammar";
  enabled?: boolean;
}) => {
  const queryKey = ["lessons"];

  if (courseLevelId) {
    queryKey.push(courseLevelId);
  }
  if (lessonType) {
    queryKey.push(lessonType);
  }

  console.log("lessons");
  if (query) queryKey.push(query);
  if (lessonType) queryKey.push(lessonType);

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
      let url = `lesson`;
      if (lessonType) url += `?type=${lessonType}`;
      if (courseLevelId) url += `?courseLevelId=${courseLevelId}`;

      const response = await axios.get(url, { signal });
      return response.data as GetLessonsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const lessons = useMemo(
    () => data?.pages.flatMap((page) => page?.lessons),
    [data]
  );

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
