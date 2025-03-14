import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type NoteType = {
  _id: string;
  title: string;
  userId: string;
  content: string;
};

type GetNotesResponse = {
  notes: NoteType[];
  notesCount: number;
  nextPage: number;
};

const useGetNotes = ({
  enabled = true,
  query,
}: {
  enabled?: boolean;
  query?: string;
} = {}) => {
  let queryKey = query ? ["notes", query] : ["notes"];

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
    queryFn: async ({ signal, pageParam }) => {
      let url = `note/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;

      const response = await axios.get(url, { signal });
      return response.data as GetNotesResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const notes = useMemo(() => {
    return data?.pages.flatMap((page) => page.notes);
  }, [data]);

  return {
    notes,
    notesCount: data?.pages[0]?.notesCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetNotes;
