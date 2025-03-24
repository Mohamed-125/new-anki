import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CourseType } from "./useGetCourses";

const useCourseMutations = () => {
  const queryClient = useQueryClient();

  const createCourse = useMutation({
    mutationFn: async (courseData: Omit<CourseType, "_id">) => {
      const response = await axios.post("courses", courseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({
      id,
      courseData,
    }: {
      id: string;
      courseData: Partial<CourseType>;
    }) => {
      const response = await axios.patch(`course/${id}`, courseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`course/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export default useCourseMutations;
