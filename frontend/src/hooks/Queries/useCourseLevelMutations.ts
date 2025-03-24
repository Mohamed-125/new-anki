import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type courseLevelType = {
  name: string;
  description?: string;
  img?: string;
  _id: string;
  courseId: string;
};

const usecourseLevelMutations = (courseId: string) => {
  const queryClient = useQueryClient();

  const createcourseLevel = useMutation({
    mutationFn: async (courseLevelData: Omit<courseLevelType, "_id">) => {
      const response = await axios.post(
        `courseLevel/${courseId}`,
        courseLevelData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseLevel", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  const updatecourseLevel = useMutation({
    mutationFn: async ({
      id,
      courseLevelData,
    }: {
      id: string;
      courseLevelData: Partial<courseLevelType>;
    }) => {
      const response = await axios.patch(`courseLevel/${id}`, courseLevelData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseLevel", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  const deletecourseLevel = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`courseLevel/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseLevel", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  return {
    createcourseLevel,
    updatecourseLevel,
    deletecourseLevel,
  };
};

export default usecourseLevelMutations;
