import ActionsDropdown from "@/components/ActionsDropdown";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddNewCourseModal from "@/components/AddNewCourseModal";
import Button from "@/components/Button";
import useGetCourses from "@/hooks/Queries/useGetCourses";
import useCourseMutations from "@/hooks/Queries/useCourseMutations";

// text
// garramer
// vocab
// excersices

export type LessoncourseLevelType = {
  name: string;
  content: string;
  type: "text" | "excercises" | "resources";
  audio?: string;
  video?: string;
  _id: string;
};

export type LessonType = {
  name: string;
  img: string;
  _id: string;
  type: "lesson" | "revision" | "exam";
  description?: string;
  courseLevel: LessoncourseLevelType[];
};

export type CoursecourseLevelType = {
  name: string;
  img: string;
  description?: string;
  _id: string;
  // courseLevel count
  // lesons count
  // completed lessons count for a progress bar
};

const AdminCourses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string>();
  const [defaultValues, setDefaultValues] = useState<{
    courseName?: string;
    lang?: string;
    flag?: string;
  }>();

  const { courses, isLoading, isError } = useGetCourses();
  const { deleteCourse } = useCourseMutations();

  console.log(courses);
  return (
    <div>
      <AddNewCourseModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        editId={editId}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          <span className="text-xl">+</span>
          Add new course
        </Button>
      </div>
      {courses?.map((course) => {
        return (
          <div className="flex gap-4 items-center px-4 py-5 rounded-md border shadow-md cursor-pointer border-primary">
            <Link to={course?._id} className="flex flex-1 gap-4">
              <div className="overflow-hidden w-14 h-14 rounded-full">
                <img src={course?.flag} className="w-full h-full" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{course?.name}</h2>
                <p className="mb-2 text-gray-600">Language: {course?.lang}</p>
              </div>
            </Link>

            <div className="ml-auto">
              <ActionsDropdown
                itemId={course?._id}
                editHandler={() => {
                  setEditId(course?._id);
                  setDefaultValues({
                    courseName: course?.name,
                    lang: course?.lang,
                    flag: course?.flag,
                  });
                  setIsModalOpen(true);
                }}
                deleteHandler={() => {
                  deleteCourse.mutate(course?._id);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminCourses;
