import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type VideoType = {
  _id: string;
  title: string;
  thumbnail: string;
  url: string;
  defaultCaptionData?: {
    name: string;
    transcript: any[];
    translatedTranscript: any[];
  };
};

type GetVideosResponse = {
  videos: VideoType[];
  videosCount: number;
  nextPage: number;
};

const useGetVideos = ({
  enabled = true,
  query,
}: {
  enabled?: boolean;
  query?: string;
} = {}) => {
  let queryKey = query ? ["videos", query] : ["videos"];

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
      let url = `video/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;

      const response = await axios.get(url, { signal });
      return response.data as GetVideosResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled,
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

export default useGetVideos;