import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { sampleLessons } from "@/data/sampleCourseData";
import { Trash } from "lucide-react";
import Button from "@/components/Button";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import AddNewLessonModal from "@/components/AddNewLessonModal";
import ActionsDropdown from "@/components/ActionsDropdown";
import useGetLessons from "@/hooks/Queries/useGetLessons";

const AdminCourseLevel = () => {
  const { courseId, courseLevelId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string>();
  const [defaultValues, setDefaultValues] = useState<{
    lessonName?: string;
    description?: string;
    type?: "lesson" | "revision" | "exam";
    img?: string;
  }>();
  const queryClient = useQueryClient();

  const { lessons, isLoading } = useGetLessons({
    courseLevelId: courseLevelId as string,
  });

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lessons</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          <span className="text-xl">+</span>
          Add new lesson
        </Button>
      </div>

      <AddNewLessonModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        editId={editId}
        courseLevelId={courseLevelId as string}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
      />

      <div className="grid gap-2">
        {lessons?.map((lesson) => (
          <div
            key={lesson._id}
            className={`relative flex gap-3 p-3 border transition-all hover:shadow-md ${
              lesson.type === "exam"
                ? "border-orange-200 bg-orange-50"
                : lesson.type === "revision"
                ? "border-blue-200 bg-blue-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <Link
              to={`/admin/courses/${courseId}/${courseLevelId}/${lesson._id}`}
            >
              <div className="overflow-hidden w-60 rounded-md aspect-[1.7/1]">
                <img
                  src={lesson.img}
                  alt={lesson.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
            <Link
              to={`/admin/courses/${courseId}/${courseLevelId}/${lesson._id}`}
              className="flex-1"
            >
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
                  {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                </span>
              </div>
            </Link>

            <ActionsDropdown
              itemId={lesson._id}
              editHandler={() => {
                setEditId(lesson._id);
                setDefaultValues({
                  lessonName: lesson.name,
                  description: lesson.description,
                  type: lesson.type,
                });
                setIsModalOpen(true);
              }}
              deleteHandler={async () => {
                try {
                  await axios.delete(`lesson/${lesson._id}`);
                  queryClient.invalidateQueries({
                    queryKey: ["lessons", courseLevelId],
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourseLevel;
