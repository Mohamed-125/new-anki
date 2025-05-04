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
  Check,
} from "lucide-react";
import { useLocalStorage } from "react-use";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import GrammarLessons from "./GrammarLessons";

const CoursePage = () => {
  const navigate = useNavigate();
  const [selectedLearningLanguage] = useLocalStorage(
    "selectedLearningLanguage"
  );
  const { user } = useGetCurrentUser();

  const [selectedLevel, setSelectedLevel] = useState<string>(
    user?.proficiencyLevel || ""
  );

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"course" | "grammar">("course");

  // Fetch lessons for selected level
  const { lessons, isLoading } = useGetLessons({
    courseLevelId: selectedLevel,
    enabled: Boolean(selectedLevel),
  });

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

  // Set default selected level to user's proficiency level
  useEffect(() => {
    if (user && courseLevels) {
      const userLevel = courseLevels.find((level) =>
        level.name
          ?.toLowerCase()
          ?.includes(user?.proficiencyLevel?.toLowerCase())
      );
      if (userLevel) {
        setSelectedLevel(userLevel._id);
      }
    }
  }, [user, courseLevels]);

  // const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>(
  //   {}
  // );
  // const [levelLessons, setLevelLessons] = useState<Record<string, any>>({});
  // const [loadingLessons, setLoadingLessons] = useState<Record<string, boolean>>(
  //   {}
  // );

  // Fetch lessons only when courseLevels are available

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
      <div className="container px-4 !py-0 mx-auto text-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        {/* Course Header */}
        <div className="py-3 mb-6 rouned-xl sm:p-4">
          <div className="flex gap-3 items-center">
            <div className="overflow-hidden w-20 h-20 rounded-2xl">
              <img
                className="object-cover w-full h-full rounded-full"
                src={course?.flag}
                alt={`${course?.name} flag`}
              />
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                {course?.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 sm:gap-2">
          <button
            onClick={() => setActiveTab("course")}
            className={`flex border gap-3 items-center sm:px-3 sm:py-2 sm:text-sm   px-4 py-3 text-lg font-medium rounded-xl transition-all shadow-sm ${
              activeTab === "course"
                ? "bg-blue-600 text-white shadow-blue-100"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-6 h-6" />
            Course Lessons
          </button>
          <button
            onClick={() => setActiveTab("grammar")}
            className={`flex border gap-3 items-center  sm:px-3 sm:py-2 sm:text-sm  px-4 py-3 text-lg font-medium rounded-xl transition-all shadow-sm ${
              activeTab === "grammar"
                ? "bg-blue-600 text-white shadow-blue-100"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Book className="w-6 h-6" />
            Grammar Lessons
          </button>
        </div>

        {/* Course Content */}
        <div className="mx-auto">
          {activeTab === "course" ? (
            <div className="overflow-hidden bg-white rounded-xl shadow-lg">
              <div className="flex flex-wrap justify-between items-center p-8 border-b border-gray-100">
                <div className="flex flex-wrap gap-4 items-center">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-xl">
                    Course Content
                  </h2>
                </div>
                <Button
                  onClick={() => setIsLevelModalOpen(true)}
                  className="flex gap-2 items-center px-4 py-2 font-medium text-gray-700 bg-white rounded-xl border-2 border-gray-200 transition-all text-md sm:px-4 sm:py-2 sm:text-sm hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span>
                    {courseLevels?.find((level) => level._id === selectedLevel)
                      ?.name || "Select Level"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
              {/* Level Selection Modal */}
              <Modal isOpen={isLevelModalOpen} setIsOpen={setIsLevelModalOpen}>
                <Modal.Header
                  title="Select Your Level"
                  setIsOpen={setIsLevelModalOpen}
                />
                <div className="space-y-2">
                  {courseLevels?.map((level) => (
                    <div
                      key={level._id}
                      onClick={() => {
                        setSelectedLevel(level._id);
                        setIsLevelModalOpen(false);
                      }}
                      className={`flex items-center gap-4 p-6 cursor-pointer rounded-xl border-2 transition-all ${
                        selectedLevel === level._id
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative w-12 h-12">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-[3] text-gray-200"
                            stroke="currentColor"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-[3] text-blue-500"
                            stroke="currentColor"
                            strokeDasharray={`${level?.completionPercentage} 100`}
                          />
                        </svg>
                        <div className="flex absolute inset-0 justify-center items-center text-sm font-medium">
                          {level?.completionPercentage}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {level.name}
                        </h3>
                        {level.description && (
                          <p className="text-sm text-gray-600">
                            {level.description}
                          </p>
                        )}
                      </div>
                      {selectedLevel === level._id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              </Modal>
              <div className="space-y-6">
                <div className="px-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 gap-3">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex gap-4 items-center">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="w-3/4 h-4" />
                              <Skeleton className="w-1/2 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : lessons && lessons?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {lessons?.map((lesson: any) => (
                        <div
                          key={lesson._id}
                          className={`p-4 sm:p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1 ${
                            lesson.isCompleted
                              ? "bg-green-50 border-green-300"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            // Navigate to lesson page
                            navigate(
                              `/learn/${lesson.courseLevelId}/${lesson._id}`
                            );
                          }}
                        >
                          <div className="flex gap-4 items-center">
                            <div
                              className={`p-3 rounded-full ${
                                lesson.isCompleted
                                  ? "bg-green-50"
                                  : "bg-blue-50"
                              }`}
                            >
                              {lesson.type === "lesson" ? (
                                <Book className="w-6 h-6 text-blue-600" />
                              ) : lesson.type === "revision" ? (
                                <BookOpen className="w-6 h-6 text-green-600" />
                              ) : (
                                <GraduationCap className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="flex gap-2 items-center font-semibold">
                                {lesson.name}
                                {lesson.isCompleted && (
                                  <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
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
            </div>
          ) : (
            <GrammarLessons />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
