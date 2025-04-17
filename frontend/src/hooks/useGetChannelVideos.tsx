import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { VideoType } from "./useGetVideos";

type GetChannelVideosResponse = {
  videos: VideoType[];
  videosCount: number;
  nextPage: number;
};

const useGetChannelVideos = (channelId: string, enabled: boolean) => {
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
    queryKey: ["channel-videos", channelId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `channel/get-videos?channelId=${channelId}&page=${pageParam}`,
        { signal }
      );
      return response.data as GetChannelVideosResponse;
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

export default useGetChannelVideos;
