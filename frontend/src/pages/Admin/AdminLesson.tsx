import React, { ReactNode, useEffect, useState } from "react";
import GrammarToggleButton from "@/components/GrammarToggleButton";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, PlusIcon, Trash } from "lucide-react";
import Button from "@/components/Button";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { sampleLessons } from "@/data/sampleCourseData";
import Form from "@/components/Form";
import useUseEditor from "@/hooks/useUseEditor";
import TipTapEditor from "@/components/TipTapEditor";
import AddNewSectionModal from "@/components/AddNewSectionModal";
import ActionsDropdown from "@/components/ActionsDropdown";
import useGetLesson from "@/hooks/Queries/useGetLesson";
import useGetSections from "@/hooks/Queries/useGetSections";
import useToasts from "@/hooks/useToasts";
import AdminSectionComponent from "./components/AdminSectionComponent";
import InfiniteScroll from "@/components/InfiniteScroll";

const AdminLesson = () => {
  const { lessonId, courseId } = useParams();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [questionsBySectionId, setQuestionsBySectionId] = useState<
    Record<
      string,
      Array<{
        type: "choose" | "text";
        id: number;
        choices: [];
        question: "";
        answer: "";
      }>
    >
  >({});

  const [questionCounter, setQuestionCounter] = useState(0);

  const { data: lesson, isLoading } = useGetLesson(lessonId as string);

  const { sections, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useGetSections(lessonId as string);

  const [arrangedSections, setArrangedSections] = useState(sections || []);

  console.log(arrangedSections);
  useEffect(() => {
    if (sections) {
      setArrangedSections(sections);
      const questionsBySection: Record<string, any[]> = {};
      let totalQuestions = 0;

      sections.forEach((section) => {
        const sectionQuestions =
          section.content?.questions?.map((q: any) => {
            return {
              id: q.id,
              type: q.type,
              question: q.question,
              choices: q.choices,
              answer: q.answer,
            };
          }) || [];

        questionsBySection[section._id] = sectionQuestions;
        totalQuestions += sectionQuestions.length;
      });

      setQuestionsBySectionId(questionsBySection);
      setQuestionCounter(totalQuestions);
    }
  }, [sections]);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");

  if (isLoading) return <p>isLoading</p>;

  return (
    <div>
      {lesson ? (
        <div>
          <AddNewSectionModal
            isOpen={isSectionModalOpen}
            setDefaultValues={setDefaultValues}
            setIsOpen={setIsSectionModalOpen}
            defaultValues={defaultValues}
            lessonId={lessonId ?? ""}
            editId={editId}
          />
          <div className="mb-8">
            <div className="flex gap-4 items-center mb-4">
              <div className="overflow-hidden w-60 rounded-md aspect-[1.7/1]">
                <img
                  src={lesson.img}
                  alt={lesson.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {lesson.name}
                </h1>
                <p className="text-gray-600">{lesson.description}</p>
                <div className="flex gap-3 items-center">
                  <span
                    className={`inline-block mt-2 text-sm font-medium px-2 py-0.5 rounded-full ${
                      lesson.type === "exam"
                        ? "text-orange-700 bg-orange-100"
                        : lesson.type === "revision"
                        ? "text-blue-700 bg-blue-100"
                        : lesson.type === "grammar"
                        ? "text-purple-700 bg-purple-100"
                        : "text-green-700 bg-green-100"
                    }`}
                  >
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                  </span>
                  <GrammarToggleButton
                    lessonId={lessonId ?? ""}
                    currentType={lesson.type}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">sections</h2>
            <Button
              onClick={() => {
                setIsSectionModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-xl">+</span>
              Add new section
            </Button>
          </div>
          <InfiniteScroll
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadingElement={"loading..."}
            className=""
          >
            {arrangedSections?.map((section, index) => {
              return (
                <AdminSectionComponent
                  index={index}
                  // key={section._id}
                  setQuestionsBySectionId={setQuestionsBySectionId}
                  section={section}
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  showQuestionDropdown={showQuestionDropdown}
                  setShowQuestionDropdown={setShowQuestionDropdown}
                  questionsBySectionId={questionsBySectionId}
                  setEditId={setEditId}
                  editId={editId}
                  questionCounter={questionCounter}
                  setQuestionCounter={setQuestionCounter}
                  setArrangedSections={setArrangedSections}
                  arrangedSections={arrangedSections}
                />
              );
            })}
          </InfiniteScroll>
        </div>
      ) : (
        <p>lesson not found</p>
      )}
    </div>
  );
};

export default AdminLesson;
