import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "react-use";
import useGetCourse from "../hooks/Queries/useGetCourse";
import useGetCourseLevels from "../hooks/Queries/useGetCourseLevels";
import useGetLessons from "../hooks/Queries/useGetLessons";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import {
  Check,
  ChevronRight,
  Crown,
  BookOpen,
  Book,
  GraduationCap,
  Info,
  X,
  User,
  Globe,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LearnPage = () => {
  const navigate = useNavigate();
  const [selectedLearningLanguage, setSelectedLearningLanguage] =
    useLocalStorage("selectedLearningLanguage", "english");
  const { user } = useGetCurrentUser();
  const [selectedLevel, setSelectedLevel] = useState<string>(
    user?.proficiencyLevel || ""
  );
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Available languages for dropdown
  const languages = [
    {
      id: "english",
      name: "English",
      flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png",
    },
    {
      id: "spanish",
      name: "Spanish",
      flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png",
    },
    {
      id: "french",
      name: "French",
      flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png",
    },
    {
      id: "german",
      name: "German",
      flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png",
    },
  ];

  const currentLanguage =
    languages.find((lang) => lang.id === selectedLearningLanguage) ||
    languages[0];

  const handleLevelChange = (newLevel: string) => {
    setSelectedLevel(newLevel);
    setIsLevelModalOpen(false);
  };

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
  } = useGetCourseLevels({
    courseId: course?._id as string,
    enabled: Boolean(course?._id),
  });

  // Fetch lessons for selected level
  const { lessons, isLoading: isLessonsLoading } = useGetLessons({
    courseLevelId: selectedLevel,
    enabled: Boolean(selectedLevel),
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

  // Find current level
  const currentLevel = courseLevels?.find(
    (level) => level._id === selectedLevel
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-4 mx-auto max-w-6xl">
        {/* Combined Course Header and Level Selection */}
        <Card className="overflow-hidden mb-8 rounded-xl border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-5 items-center">
              <div className="overflow-hidden w-16 h-16 rounded-full shadow-sm">
                <img
                  className="object-cover w-full h-full"
                  src={
                    course?.flag ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png"
                  }
                  alt={`${course?.name} flag`}
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {course?.name}
                </h1>

                <div className="flex flex-wrap gap-3 items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 py-1 h-auto text-sm font-medium text-indigo-700 bg-indigo-50 rounded-full border-0 hover:bg-indigo-100"
                    onClick={() => setIsLevelModalOpen(true)}
                  >
                    {currentLevel?.name || "Select a level"}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>

                  {currentLevel && (
                    <div className="flex gap-2 items-center">
                      <Progress
                        value={currentLevel.completionPercentage}
                        className="w-32 h-2 bg-gray-100 rounded-full"
                      />
                      <span className="text-sm font-medium text-indigo-600">
                        {currentLevel.completionPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Selection Modal */}
        <Dialog open={isLevelModalOpen} onOpenChange={setIsLevelModalOpen}>
          <DialogContent className="overflow-hidden p-0 rounded-xl border-0 shadow-lg sm:max-w-md">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-2xl font-bold text-center">
                Select Your Level
              </DialogTitle>
              <DialogDescription className="text-center">
                Choose the level that best matches your current language
                proficiency
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {courseLevels?.map((level) => (
                <div
                  key={level._id}
                  onClick={() => handleLevelChange(level._id)}
                  className={cn(
                    "p-4 rounded-xl transition-all cursor-pointer relative",
                    selectedLevel === level._id
                      ? "bg-indigo-50 ring-2 ring-indigo-500 ring-offset-0"
                      : "bg-white hover:bg-gray-50 shadow-sm"
                  )}
                >
                  <div className="flex gap-4 items-center">
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full shadow-sm",
                          selectedLevel === level._id
                            ? "bg-indigo-100"
                            : "bg-gray-100"
                        )}
                      >
                        {level.name.includes("A1") && (
                          <span className="font-bold text-indigo-600">A1</span>
                        )}
                        {level.name.includes("A2") && (
                          <span className="font-bold text-indigo-600">A2</span>
                        )}
                        {level.name.includes("B1") && (
                          <span className="font-bold text-indigo-600">B1</span>
                        )}
                        {level.name.includes("B2") && (
                          <span className="font-bold text-indigo-600">B2</span>
                        )}
                        {level.name.includes("C1") && (
                          <span className="font-bold text-indigo-600">C1</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {level.name}
                      </h3>
                      {level.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {level.description}
                        </p>
                      )}
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            Progress
                          </span>
                          <span className="text-xs font-medium text-indigo-600">
                            {level.completionPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={level.completionPercentage}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                    {selectedLevel === level._id && (
                      <div className="flex absolute top-3 right-3 justify-center items-center w-6 h-6 bg-indigo-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <div className="flex gap-2 items-center">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {level.name.includes("A1") && "For absolute beginners"}
                        {level.name.includes("A2") &&
                          "For elementary knowledge"}
                        {level.name.includes("B1") &&
                          "For intermediate speakers"}
                        {level.name.includes("B2") &&
                          "For upper intermediate speakers"}
                        {level.name.includes("C1") && "For advanced speakers"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                className="w-full text-gray-700 bg-gray-100 rounded-full border-0 hover:bg-gray-200"
                onClick={() => setIsLevelModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* Chapter/Lesson List */}
        <div className="mb-8">
          <div className="overflow-hidden mb-6 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                Continue Learning
              </h2>
            </div>
          </div>

          {isLessonsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden rounded-xl border-0 shadow-md transition-all duration-200"
                >
                  <div className="relative bg-gray-100 aspect-video">
                    <Skeleton className="w-full h-full rounded-t-xl" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 w-1/2 h-5 rounded-full" />
                    <Skeleton className="w-full h-4 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : lessons && lessons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson: any) => (
                <Card
                  key={lesson._id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-0 shadow-md rounded-xl cursor-pointer"
                  onClick={() =>
                    navigate(`/learn/${lesson.courseLevelId}/${lesson._id}`)
                  }
                >
                  <div className="overflow-hidden relative rounded-t-xl aspect-video">
                    {lesson.imageUrl ? (
                      <img
                        src={lesson.imageUrl}
                        alt={lesson.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="flex justify-center items-center w-16 h-16 rounded-full backdrop-blur-sm bg-white/50">
                          {lesson.type === "lesson" ? (
                            <Book className="w-8 h-8 text-blue-500" />
                          ) : lesson.type === "revision" ? (
                            <BookOpen className="w-8 h-8 text-green-500" />
                          ) : (
                            <GraduationCap className="w-8 h-8 text-purple-500" />
                          )}
                        </div>
                      </div>
                    )}
                    {lesson.isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        <span className="capitalize">{lesson.type}</span>
                      </span>
                      {lesson.duration && (
                        <span className="text-xs font-medium text-gray-500">
                          {lesson.duration} min
                        </span>
                      )}
                      {lesson.difficulty && (
                        <span className="text-xs font-medium text-gray-500">
                          {lesson.difficulty}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {lesson.name}
                    </h3>

                    {lesson.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-white rounded-xl shadow-sm">
              <div className="flex justify-center items-center mx-auto mb-4 w-20 h-20 bg-gray-50 rounded-full">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">
                No lessons available for this level yet.
              </p>
            </div>
          )}
        </div>

        {/* Premium Banner */}
        <div className="p-6 mt-8 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="mb-2 text-xl font-bold">Upgrade to Premium</h3>
              <p className="text-indigo-100">
                Get unlimited access to all lessons and features
              </p>
            </div>
            <div className="flex items-center">
              <Crown className="mr-2 w-6 h-6 text-yellow-300" />
              <Button className="text-indigo-700 bg-white hover:bg-indigo-50">
                Go Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
