import React, { useEffect, useState } from "react";
import useGetCourse from "@/hooks/Queries/useGetCourse";
import useCourseMutations from "@/hooks/Queries/useCourseMutations";
import useGetCourseLevels from "@/hooks/Queries/useGetCourseLevels";
import usecourseLevelMutations from "@/hooks/Queries/useCourseLevelMutations";
import useGetTopics from "@/hooks/useGetTopics";
import useTopicMutations from "@/hooks/Queries/useTopicMutations";
import {
  ChevronDown,
  ChevronUp,
  Delete,
  DeleteIcon,
  Trash,
} from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import AddNewCourseLevelModal from "@/components/AddNewCourseLevelModal";
import AddNewTopicModal from "@/components/AddNewTopicModal";
import Button from "@/components/Button";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { sampleLessons } from "@/data/sampleCourseData";
import DragableComponent from "@/components/DraggableComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfiniteScroll from "@/components/InfiniteScroll";
import AdminTopics from "./AdminTopics";

const AdminCourse = () => {
  const [isCourseLevelModalOpen, setIsCourseLevelModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editId, setEditId] = useState<string>();
  const [defaultValues, setDefaultValues] = useState<{
    courseLevelName?: string;
    description?: string;
  }>();
  const [defaultTopicValues, setDefaultTopicValues] = useState<{
    title?: string;
    description?: string;
    language?: string;
    type: string;
  }>();
  const queryClient = useQueryClient();
  const [expandedcourseLevels, setExpandedcourseLevels] = useState<string[]>(
    []
  );
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("courseLevels");

  const { courseId } = useParams();

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useGetCourse({ courseId: courseId || "" });

  const {
    courseLevels,
    isLoading: courseLevelsLoading,
    isError: courseLevelsError,
  } = useGetCourseLevels({ courseId: courseId || "" });

  const { updateCourse } = useCourseMutations();
  const { deletecourseLevel } = usecourseLevelMutations(courseId || "");

  const {
    topics,
    isInitialLoading: topicsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetTopics({ enabled: activeTab === "topics" });

  const { deleteTopic, reorderTopics } = useTopicMutations();

  const [arrangedTopics, setArrangedTopics] = useState(topics || []);

  useEffect(() => {
    if (topics) {
      setArrangedTopics(topics);
    }
  }, [topics]);

  const handleReorder = (newArrangedArr: any[]) => {
    reorderTopics.mutate(newArrangedArr);
  };

  const [arrangedCourseLevels, setArrangedCourseLevels] = useState(
    courseLevels || []
  );

  useEffect(() => {
    if (courseLevels) {
      setArrangedCourseLevels(courseLevels);
    }
  }, [courseLevels]);

  if (courseLoading || courseLevelsLoading) return <div>Loading...</div>;
  if (courseError || courseLevelsError) return <div>Error loading data</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="flex gap-4 items-center mb-4">
          <img
            src={course.flag}
            alt="Course Flag"
            className="object-cover w-12 h-8 rounded-md shadow-sm"
          />
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
        </div>
        <p className="text-gray-600">Language: {course?.lang?.toUpperCase()}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courseLevels">Course Levels</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="courseLevels">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Course Levels</h2>
            <Button
              onClick={() => setIsCourseLevelModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-xl">+</span>
              Add new courseLevel
            </Button>
          </div>

          <AddNewCourseLevelModal
            isOpen={isCourseLevelModalOpen}
            setIsOpen={setIsCourseLevelModalOpen}
            editId={editId}
            courseId={course._id}
            defaultValues={defaultValues}
            setDefaultValues={setDefaultValues}
          />

          <div className="grid gap-8">
            {arrangedCourseLevels?.map((courseLevel, index) => (
              <DragableComponent
                order={index + 1}
                setState={setArrangedCourseLevels}
                state={arrangedCourseLevels}
                key={courseLevel._id}
              >
                <div key={index} className="overflow-hidden bg-white shadow-md">
                  <div className="p-6 text-white bg-blue-500 rounded-t-xl">
                    <div className="flex justify-between items-center mb-4">
                      <Link
                        to={`/admin/courses/${courseId}/${courseLevel?._id}`}
                        className="flex-1"
                      >
                        <div className="flex gap-2 items-center">
                          {expandedcourseLevels.includes(courseLevel?._id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                          <h2 className="text-2xl font-semibold">
                            {courseLevel.name}
                          </h2>
                        </div>
                        <p className="text-gray-200">
                          {courseLevel.description}
                        </p>
                      </Link>
                      <div className="flex gap-2 items-center">
                        <ActionsDropdown
                          itemId={courseLevel._id}
                          editHandler={() => {
                            setEditId(courseLevel._id);
                            setDefaultValues({
                              courseLevelName: courseLevel.name,
                              description: courseLevel.description,
                            });
                          }}
                          deleteHandler={() => {
                            deletecourseLevel.mutate(courseLevel?._id);
                          }}
                        />
                      </div>{" "}
                    </div>
                  </div>
                </div>

                <div
                  className={` transition-all duration-300 ease-in-out ${
                    expandedcourseLevels.includes(courseLevel._id)
                      ? "opacity-100"
                      : "opacity-0 max-h-0 overflow-hidden"
                  }`}
                >
                  {sampleLessons.map((lesson, lessonIndex) => (
                    <Link
                      to={`/admin/courses/${courseId}/${lesson._id}`}
                      key={lessonIndex}
                      className={`relative flex gap-3 p-3 border transition-all hover:shadow-md ${
                        lesson.type === "exam"
                          ? "border-orange-200 bg-orange-50"
                          : lesson.type === "revision"
                          ? "border-blue-200 bg-blue-50"
                          : "border-green-200 bg-green-50"
                      }`}
                    >
                      <div className="overflow-hidden w-60 mb-2 rounded-md aspect-[1.7/1]">
                        <img
                          src={lesson.img}
                          alt={lesson.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-1">
                          {lesson.name}
                        </h3>
                        <p className="mb-2 text-xs text-gray-600 line-clamp-2">
                          {lesson.description}
                        </p>
                        <div className="flex gap-3 items-center mt-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              lesson.type === "exam"
                                ? "text-orange-700 bg-orange-100"
                                : lesson.type === "revision"
                                ? "text-blue-700 bg-blue-100"
                                : "text-green-700 bg-green-100"
                            }`}
                          >
                            {lesson.type.charAt(0).toUpperCase() +
                              lesson.type.slice(1)}
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            className="gap-2 text-xs font-medium transition-colors"
                          >
                            <Trash /> Delete
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </DragableComponent>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <AdminTopics course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCourse;
