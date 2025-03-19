import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import useGetCurrentUser from "./useGetCurrentUser";

export type PlaylistType = {
  _id: string;
  name: string;
  videos?: any[];
  videosCount?: number;
};

type GetPlaylistsResponse = {
  playlists: PlaylistType[];
  playlistsCount: number;
  nextPage: number;
};

const useGetPlaylists = ({
  enabled = true,
  query,
}: {
  enabled?: boolean;
  query?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey = query ? ["playlists", query] : ["playlists"];

  queryKey.push(selectedLearningLanguage);

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
      let url = `playlist/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

      const response = await axios.get(url, { signal });
      return response.data as GetPlaylistsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
  });

  const playlists = useMemo(() => {
    return data?.pages.flatMap((page) => page.playlists);
  }, [data]);

  return {
    playlists,
    playlistsCount: data?.pages[0]?.playlistsCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetPlaylists;
