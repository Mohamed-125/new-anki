import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import AdminSectionComponent from "./components/AdminSectionComponent";
import InfiniteScroll from "@/components/InfiniteScroll";
import useGetLesson from "@/hooks/Queries/useGetLesson";
import useGetSections from "@/hooks/Queries/useGetSections";
import Button from "@/components/Button";
import { Plus } from "lucide-react";
import useToasts from "@/hooks/useToasts";
import { useQueryClient } from "@tanstack/react-query";
import AddNewSectionModal from "@/components/AddNewSectionModal";

const AdminLesson = () => {
  // State management
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [questionsBySectionId, setQuestionsBySectionId] = useState<
    Record<string, any[]>
  >({});
  const [questionCounter, setQuestionCounter] = useState(0);
  const [editId, setEditId] = useState("");
  const [arrangedSections, setArrangedSections] = useState<any[]>([]);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  // Hooks
  const { lessonId, courseId } = useParams();
  const { data } = useGetLesson(lessonId as string);
  const { sections, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetSections(lessonId as string);
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const lesson = data?.lesson;
  // Initialize arranged sections when sections data changes
  useEffect(() => {
    if (sections.length > 0) {
      setArrangedSections(sections);
    }
  }, [sections]);

  // Initialize questions state when sections data changes
  useEffect(() => {
    if (sections.length > 0) {
      const questionsBySection: Record<string, any[]> = {};
      let counter = 0;

      sections.forEach((section) => {
        if (section.content?.questions?.length > 0) {
          questionsBySection[section._id] = section.content.questions.map(
            (question: any) => {
              counter++;
              return { ...question, id: counter };
            }
          );
        }
      });

      setQuestionsBySectionId(questionsBySection);
      setQuestionCounter(counter);
    }
  }, [sections]);

  // Handler for opening the add section modal
  const handleAddSection = useCallback(() => {
    setIsAddSectionModalOpen(true);
  }, []);

  // Handler for when a section is successfully added
  const handleSectionAdded = useCallback((sectionId: string) => {
    // Expand the newly added section
    setExpandedSections((prev) => [...prev, sectionId]);
  }, []);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{lesson?.name}</h1>
        <p className="text-gray-600">{lesson?.description}</p>
      </div>

      <div className="mb-8">
        <Button onClick={handleAddSection} className="flex gap-2 items-center">
          <Plus size={20} />
          Add new section
        </Button>
      </div>

      <AddNewSectionModal
        isOpen={isAddSectionModalOpen}
        setIsOpen={setIsAddSectionModalOpen}
        lessonId={lessonId as string}
        onSectionAdded={handleSectionAdded}
      />

      <InfiniteScroll
        fetchNextPage={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadingElement={<h4>Loading...</h4>}
        className="space-y-6"
      >
        {arrangedSections.map((section, index) => (
          <AdminSectionComponent
            key={section._id}
            section={section}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
            showQuestionDropdown={showQuestionDropdown}
            setShowQuestionDropdown={setShowQuestionDropdown}
            questionsBySectionId={questionsBySectionId}
            setQuestionsBySectionId={setQuestionsBySectionId}
            setEditId={setEditId}
            editId={editId}
            questionCounter={questionCounter}
            setQuestionCounter={setQuestionCounter}
            index={index}
            arrangedSections={arrangedSections}
            setArrangedSections={setArrangedSections}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default React.memo(AdminLesson);
