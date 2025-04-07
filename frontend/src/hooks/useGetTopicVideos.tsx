import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { VideoType } from "./useGetVideos";

type GetTopicVideosResponse = {
  videos: VideoType[];
  videosCount: number;
  nextPage: number;
};

const useGetTopicVideos = (topicId: string, enabled: boolean) => {
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
    queryKey: ["topic-videos", topicId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `topic/videos/${topicId}?page=${pageParam}`,
        { signal }
      );
      return response.data as GetTopicVideosResponse;
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

export default useGetTopicVideos;
