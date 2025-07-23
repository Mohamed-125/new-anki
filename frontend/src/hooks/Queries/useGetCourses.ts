import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type CourseType = {
  name: string;
  lang: string;
  flag: string;
  _id: string;
};

type GetCoursesResponse = {
  courses: CourseType[];
  nextPage: number;
  coursesCount: number;
};

const useGetCourses = ({
  query,
  enabled = true,
}: {
  query?: string;
  enabled?: boolean;
} = {}) => {
  const queryKey = ["courses"];
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
      let url = `course/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;

      const response = await axios.get(url, { signal });
      return response.data as GetCoursesResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const courses = useMemo(() => {
    return data?.pages.flatMap((page) => page.courses || []);
  }, [data?.pages]);

  return {
    courses,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    coursesCount: data?.pages[0].coursesCount,
  };
};

export default useGetCourses;
