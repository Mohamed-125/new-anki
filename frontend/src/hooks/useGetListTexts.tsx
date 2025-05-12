import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { TextType } from "./useGetTexts";

type GetListTextsResponse = {
  texts: TextType[];
  textsCount: number;
  nextPage: number;
};

const useGetListTexts = (listId: string, enabled: boolean) => {
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
    queryKey: ["list-texts", listId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `list/texts/${listId}?page=${pageParam}`,
        { signal }
      );
      return response.data as GetListTextsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const texts = useMemo(() => {
    return data?.pages.flatMap((page) => page.texts);
  }, [data]);

  return {
    texts,
    textsCount: data?.pages[0]?.textsCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetListTexts;
