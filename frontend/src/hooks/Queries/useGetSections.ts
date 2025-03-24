import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { sectionType } from "./useSectionMutations";
import { useMemo } from "react";

type GetSectionsResponse = {
  sections: sectionType[];
  nextPage: number;
  sectionsCount: number;
};

const useGetSections = (lessonId: string) => {
  const queryKey = ["section", lessonId];

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
      let url = `section?lessonId=${lessonId}&page=${pageParam}`;

      const response = await axios.get(url, { signal });
      return response.data as GetSectionsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const sections = useMemo(() => {
    return data?.pages.flatMap((page) => page.sections) || [];
  }, [data]);

  return {
    sections,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    sectionsCount: data?.pages[0].sectionsCount,
  };
};

export default useGetSections;
