import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { sectionType } from "./useSectionMutations.ts";
import { useMemo, useEffect } from "react";

type GetSectionsResponse = {
  sections: sectionType[];
  nextPage: number;
  sectionsCount: number;
};

const useGetSections = (lessonId: string, currentSectionIndex: number = 0) => {
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

  useEffect(() => {
    const threshold = 3; // Start loading when 3 sections away from the end
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      sections.length > 0 &&
      currentSectionIndex >= sections.length - threshold
    ) {
      fetchNextPage();
    }
  }, [
    currentSectionIndex,
    sections.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  return {
    sections,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    sectionsCount: data?.pages[0].sectionsCount as number,
  };
};

export default useGetSections;
