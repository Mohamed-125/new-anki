import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type ListType = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoCount: number;
  completedVideos: string[]
  completedTexts: string[]
  totalDuration?: number;
};

const useGetList = (listId: string, enabled: boolean = true) => {
  const {
    data: list,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userList", listId],
    queryFn: async ({ signal }) => {
      const [userListResponse, listResponse] = await Promise.all([
        axios.get(`list/user/${listId}`, { signal }),
        axios.get(`list/${listId}`, { signal })
      ]);
      return {
        ...listResponse.data,
        completedVideos: userListResponse.data.completedVideos || [],
        completedTexts: userListResponse.data.completedTexts || []
      } as ListType;
    },
    enabled,
  });

  return { list, isLoading, error };
};

export default useGetList;
