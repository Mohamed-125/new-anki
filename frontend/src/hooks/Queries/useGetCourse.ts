import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CourseType } from "./useGetCourses";

const useGetCourse = ({
  courseId,
  lang,
  enabled = true,
}: {
  courseId?: string;
  lang?: string;
  enabled?: boolean;
}) => {
  const queryKey = ["course"];
  if (courseId) {
    queryKey.push(courseId);
  }
  if (lang) {
    queryKey.push(lang);
  }
  return useQuery({
    queryKey,

    queryFn: async ({ signal }) => {
      let url = `course`;
      if (courseId) {
        url = `course/${courseId}`;
      }
      if (lang) {
        url += `/user-course?lang=${lang}`;
      }

      const response = await axios.get(url, { signal });

      return response.data as CourseType;
    },
    enabled,
  });
};

export default useGetCourse;
