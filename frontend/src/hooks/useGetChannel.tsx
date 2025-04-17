import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type ChannelType = {
  _id: string;
  name: string;
  description: string;
  url: string;
  thumbnail: string;
  topicId?: string;
  topicOrder: number;
  createdAt: string;
  updatedAt: string;
};

const useGetChannel = (channelId: string) => {
  const { data: channel, isLoading } = useQuery<ChannelType>({
    queryKey: ["channel", channelId],
    queryFn: async ({ signal }) => {
      const response = await axios.get(`channel/${channelId}`, { signal });
      return response.data;
    },
    enabled: !!channelId,
  });

  return {
    channel,
    isLoading,
  };
};

export default useGetChannel;
