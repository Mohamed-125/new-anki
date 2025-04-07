import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TopicType } from "../useGetTopics";

const useTopicMutations = () => {
  const queryClient = useQueryClient();

  const createTopic = useMutation({
    mutationFn: async (topicData: Partial<TopicType>) => {
      console.log("topicData", topicData);
      const response = await axios.post("topic", topicData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const updateTopic = useMutation({
    mutationFn: async ({
      id,
      topicData,
    }: {
      id: string;
      topicData: Partial<TopicType>;
    }) => {
      const response = await axios.patch(`topic/${id}`, topicData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`topic/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const reorderTopics = useMutation({
    mutationFn: async (topics: TopicType[]) => {
      const response = await axios.patch("topic/reorder", { topics });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  return {
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
  };
};

export default useTopicMutations;
