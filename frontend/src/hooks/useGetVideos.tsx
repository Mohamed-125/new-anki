import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import useGetCurrentUser from "./useGetCurrentUser";

export type VideoType = {
  _id: string;
  title: string;
  topicId: string;
  channelId: string;
  url: string;
  // availableCaptions: string[];
  defaultCaptionData: {
    name: string;
    transcript?: {
      dur: string;
      start: string;
      text: string;
    };
    translatedTranscript?: {
      dur: string;
      start: string;
      text: string;
    };
  };
  playlistId: string;
  thumbnail: string;
  userId: string;
};

type GetVideosResponse = {
  videos: VideoType[];
  videosCount: number;
  nextPage: number;
};

const useGetVideos = ({
  enabled = true,
  playlistId,
  query,
}: {
  enabled?: boolean;
  query?: string;
  playlistId?: string;
} = {}) => {
  const { selectedLearningLanguage } = useGetCurrentUser();
  let queryKey = query
    ? ["videos", query]
    : playlistId
    ? ["videos", playlistId]
    : ["videos"];

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
      let url = `video/?page=${pageParam}`;
      if (query) url += `&searchQuery=${query}`;
      if (playlistId) url += `&playlistId=${playlistId}`;
      if (selectedLearningLanguage)
        url += `&language=${selectedLearningLanguage}`;

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
