import { useNavigate, useParams } from "react-router-dom";
import useGetCourse from "../hooks/Queries/useGetCourse";
import useGetCourseLevels from "../hooks/Queries/useGetCourseLevels";
import useGetLessons from "../hooks/Queries/useGetLessons";
import { useEffect, useState } from "react";
import {
  Book,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { courseLevelType } from "@/hooks/Queries/useCourseLevelMutations";
import { useLocalStorage } from "react-use";

const fetchLessonsByCourseLevel = async (courseLevelId: string) => {
  let url = `lesson?courseLevelId=${courseLevelId}`;
  const response = await axios.get(url);
  return response;
};

const useGetAllLessons = (courseLevels: courseLevelType[] | []) => {
  return useQueries({
    queries: courseLevels.map((level) => ({
      queryKey: ["lessons", level._id], // Unique query key for each level
      queryFn: () => fetchLessonsByCourseLevel(level._id), // Function to fetch lessons
      enabled: !!level._id, // Only fetch if ID exists
    })),
  });
};

const CoursePage = () => {
  // const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [selectedLearningLanguage] = useLocalStorage(
    "selectedLearningLanguage"
  );

  // const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>(
  //   {}
  // );
  // const [levelLessons, setLevelLessons] = useState<Record<string, any>>({});
  // const [loadingLessons, setLoadingLessons] = useState<Record<string, boolean>>(
  //   {}
  // );

  // Fetch course data

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useGetCourse({ lang: selectedLearningLanguage as string });

  // Fetch course levels
  const {
    courseLevels,
    isLoading: isLevelsLoading,
    isError: isLevelsError,
    fetchNextPage: fetchNextLevelsPage,
    hasNextPage: hasNextLevelsPage,
  } = useGetCourseLevels({
    courseId: course?._id as string,
    enabled: Boolean(course?._id),
  });

  // Fetch lessons only when courseLevels are available
  const lessonQueries = useGetAllLessons(courseLevels || []);

  // Handle loading state
  const isLessonsLoading = lessonQueries.some((q) => q.isLoading);
  const isLessonsError = lessonQueries.some((q) => q.isError);

  // Combine lessons from all levels
  const allLessons = lessonQueries.flatMap((q) => {
    return q.data || [];
  });

  // Handle loading states
  if (isCourseLoading || isLevelsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full border-4 animate-spin border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent"></div>
          <p className="mt-4 text-lg font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (isCourseError || isLevelsError) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2">
          Failed to load course data. Please try again later.
        </p>
        <button
          onClick={() => navigate("/courses")}
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Course Header */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <div className="flex gap-4 items-center mb-4">
          <div className="overflow-hidden w-16 rounded-full aspect-square">
            <img
              className="object-cover w-full h-full"
              src={course?.flag}
            ></img>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{course?.name}</h1>
            <p className="text-gray-600">{course?.lang}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/courses")}
          className="px-4 py-2 text-blue-600 rounded-md border border-blue-600 hover:bg-blue-50"
        >
          Back to Courses
        </button>
      </div>

      {/* Course Content */}
      <div className="container mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-2xl font-semibold">Course Content</h2>

          {courseLevels && courseLevels.length > 0 ? (
            <div className="space-y-6">
              {courseLevels.map((level, levelIndex) => {
                const lessons = allLessons[levelIndex]?.data?.lessons;
                return (
                  <div
                    key={level._id}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    {/* Level Header */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer">
                      <div className="flex gap-3 items-center">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold">{level.name}</h3>
                      </div>
                    </div>

                    {/* Level Lessons */}
                    <div className="p-4">
                      {lessons?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {lessons?.map((lesson: any) => (
                            <div
                              key={lesson._id}
                              className="p-4 rounded-lg border border-gray-200 transition cursor-pointer hover:border-blue-300 hover:shadow-md"
                              onClick={() => {
                                // Navigate to lesson page
                                navigate(`/learn/${lesson._id}`);
                              }}
                            >
                              <div className="flex gap-4 items-center">
                                <div className="p-3 bg-blue-50 rounded-full">
                                  {lesson.type === "lesson" ? (
                                    <Book className="w-5 h-5 text-blue-600" />
                                  ) : lesson.type === "revision" ? (
                                    <BookOpen className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold">
                                    {lesson.name}
                                  </h3>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <span className="inline-block px-2 py-1 mt-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                    {lesson.type.charAt(0).toUpperCase() +
                                      lesson.type.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                          <p>No lessons available for this level yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No course levels available for this course yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
