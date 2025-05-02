import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { CollectionType } from "./useGetCollections";
import useGetCurrentUser from "./useGetCurrentUser";

type GetSectionCollectionsResponse = {
  collections: CollectionType[];
  nextPage: number;
  collectionsCount: number;
};

const useGetSectionCollections = ({
  enabled = true,
  query,
  sectionId,
}: {
  enabled?: boolean;
  query?: string;
  sectionId: string;
}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey = ["collections", "section", sectionId];

  if (query) {
    queryKey.push(query);
  }

  queryKey.push(selectedLearningLanguage);

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
      let url = `collection/?page=${pageParam}`;

      if (query) url += `&searchQuery=${query}`;
      if (sectionId) url += `&sectionId=${sectionId}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

      const response = await axios.get(url, { signal });
      return response.data as GetSectionCollectionsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const collections = useMemo(() => {
    return data?.pages.flatMap((page) => page.collections);
  }, [data]);

  return {
    collections,
    collectionsCount: data?.pages[0]?.collectionsCount,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetSectionCollections;
