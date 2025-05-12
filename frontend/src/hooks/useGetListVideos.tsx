import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { VideoType } from "./useGetVideos";

type GetListVideosResponse = {
  videos: VideoType[];
  videosCount: number;
  nextPage: number;
};

const useGetListVideos = (listId: string, enabled: boolean) => {
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
    queryKey: ["videos", listId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `list/videos/${listId}?page=${pageParam}`,
        { signal }
      );
      return response.data as GetListVideosResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const videos = useMemo(() => {
    return data?.pages.flatMap((page) => page.videos);
  }, [data]);

  return {
    videos,
    videosCount: data?.pages[0]?.videosCount,
    fetchNextPage,
    isInitialLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetListVideos;
