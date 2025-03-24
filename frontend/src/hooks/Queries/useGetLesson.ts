import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LessonType } from "@/hooks/Queries/useLessonMutations";

const useGetLesson = (lessonId: string, enabled = true) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async ({ signal }) => {
      const response = await axios.get(`lesson/${lessonId}`, { signal });

      console.log(response.data);
      return response.data as LessonType;
    },
    enabled,
  });
};

export default useGetLesson;
