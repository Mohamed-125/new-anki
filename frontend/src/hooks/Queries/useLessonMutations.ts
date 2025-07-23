import { LessoncourseLevelType } from "./../../pages/Admin/AdminCourses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type LessonType = {
  name: string;
  description?: string;
  img: string;
  type: "lesson" | "revision" | "exam" | "grammar";
  _id: string;
  isCompleted: boolean;
  courseLevel: string; // Reference to CourseLevel document
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  courseLevelId: string;
  // courseLevel: LessoncourseLevelType[];
};

const useLessonMutations = (courseLevelId: string) => {
  const queryClient = useQueryClient();

  const createLesson = useMutation({
    mutationFn: async (lessonData: Omit<LessonType, "_id">) => {
      const response = await axios.post(`lesson/${courseLevelId}`, lessonData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseLevelId] });
      queryClient.invalidateQueries({
        queryKey: ["courseLevel", courseLevelId],
      });
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({
      id,
      lessonData,
    }: {
      id: string;
      lessonData: Partial<LessonType>;
    }) => {
      const response = await axios.patch(`lesson/${id}`, lessonData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseLevelId] });
      queryClient.invalidateQueries({
        queryKey: ["courseLevel", courseLevelId],
      });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`lesson/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseLevelId] });
      queryClient.invalidateQueries({
        queryKey: ["courseLevel", courseLevelId],
      });
    },
  });

  return {
    createLesson,
    updateLesson,
    deleteLesson,
  };
};

export default useLessonMutations;
