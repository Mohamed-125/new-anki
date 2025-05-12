import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

export type ChannelType = {
  _id: string;
  name: string;
  url: string;
  description?: string;
  thumbnail?: string;
  topicId?: string;
};

type GetTopicChannelsResponse = {
  channels: ChannelType[];
  channelsCount: number;
  nextPage: number;
};

const useGetTopicChannels = (topicId: string, enabled: boolean) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["topic-channels", topicId],
    enabled,
    queryFn: async ({ signal, pageParam }) => {
      const response = await axios.get(
        `topic/channels/${topicId}?page=${pageParam}`,
        { signal }
      );
      return response.data as GetTopicChannelsResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const channels = useMemo(() => {
    return data?.pages.flatMap((page) => page.channels);
  }, [data]);

  return {
    channels,
    channelsCount: data?.pages[0]?.channelsCount,
    fetchNextPage,
    isLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetTopicChannels;
