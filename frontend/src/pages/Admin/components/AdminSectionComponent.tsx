import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useToasts from "@/hooks/useToasts";
import { sectionType } from "@/hooks/Queries/useSectionMutations";
import DragableComponent from "@/components/DraggableComponent";
import SectionHeader from "./SectionHeader";
import { useQueryClient } from "@tanstack/react-query";
import useUseEditor from "@/hooks/useUseEditor";
import Button from "@/components/Button";
import { Plus, StickyNote } from "lucide-react";
import useModalsStates from "@/hooks/useModalsStates";
import ItemCard from "@/components/ui/ItemCard";
import { ResourceType } from "@/pages/LessonPage";
import useGetSectionNotes from "@/hooks/useGetSectionNotes";
import Modal from "@/components/Modal";

// Lazy load components that are only needed when a section is expanded
// Lazy load components that are only needed when modal is opened
const AdminSectionCards = lazy(() => import("./AdminSectionCards"));
const SectionFormLazy = lazy(() => import("./SectionForm"));

interface AdminSectionComponentProps {
  isCollectionModalOpen?: boolean;
  setIsCollectionModalOpen?: (open: boolean) => void;
  parentCollectionId?: string;
  defaultValues?: any;
  setDefaultValues?: (values: any) => void;
  section: sectionType; // The section data
  expandedSections: string[];
  setExpandedSections: React.Dispatch<React.SetStateAction<string[]>>;
  showQuestionDropdown: boolean;
  setShowQuestionDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  questionsBySectionId?: Record<string, any[]>;
  setQuestionsBySectionId: any;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  editId: string;
  questionCounter: number;
  setQuestionCounter: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  arrangedSections: sectionType[];
  setArrangedSections: React.Dispatch<React.SetStateAction<sectionType[]>>;
}

const AdminSectionComponent = ({
  section,
  expandedSections,
  setExpandedSections,
  showQuestionDropdown,
  setShowQuestionDropdown,
  questionsBySectionId = {},
  setEditId,
  setQuestionsBySectionId,
  questionCounter,
  editId,
  index,
  setQuestionCounter,
  arrangedSections,
  setArrangedSections,
}: AdminSectionComponentProps) => {
  const { addToast } = useToasts();
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const { lessonId } = useParams();
  const [sectionType, setSectionType] = useState(section.type);
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [copy, setCopy] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const queryClient = useQueryClient();
  const { editor, setContent } = useUseEditor();
  const isExpanded = expandedSections.includes(section._id);
  const navigate = useNavigate();

  // Memoize this function to prevent unnecessary re-renders
  const addQuestionHandler = React.useCallback(
    (type: "choose" | "text") => {
      if (!currentSectionId) return;

      setQuestionsBySectionId((prev: any) => ({
        ...prev,
        [currentSectionId]: [
          ...(prev[currentSectionId] || []),
          { type, id: questionCounter },
        ],
      }));
      setQuestionCounter((prev) => prev + 1);
    },
    [
      currentSectionId,
      questionCounter,
      setQuestionCounter,
      setQuestionsBySectionId,
    ]
  );

  const handlePasteContent = React.useCallback(
    async (pasteContent: string) => {
      const toast = addToast("Processing questions...", "promise");
      try {
        // Try to parse the input as JSON, if it fails, try to evaluate it as a JavaScript object
        let questions;
        try {
          questions = JSON.parse(pasteContent);
        } catch (parseError) {
          try {
            // Remove any 'const', 'let', or 'var' declarations
            const cleanedContent = pasteContent.replace(
              /^(const|let|var)\s+\w+\s*=\s*/,
              ""
            );
            // Safely evaluate the JavaScript object
            questions = eval("(" + cleanedContent + ")");
          } catch (evalError) {
            throw new Error(
              "Invalid input: Please provide a valid JSON array or JavaScript object"
            );
          }
        }

        if (!Array.isArray(questions)) {
          throw new Error("Invalid format: Expected an array of questions");
        }

        if (!currentSectionId) {
          throw new Error("No section selected");
        }

        // Validate and process each question
        const validatedQuestions = questions.map((question) => {
          if (!question || typeof question !== "object") {
            throw new Error(
              "Invalid question format: Each question must be an object"
            );
          }

          if (
            !question.type ||
            !question.question ||
            !question.choices ||
            !question.answer
          ) {
            throw new Error(
              "Invalid question format: Missing required fields (type, question, choices, answer)"
            );
          }

          if (question.type !== "choose" && question.type !== "text") {
            throw new Error(
              `Invalid question type: ${question.type}. Must be either 'choose' or 'text'`
            );
          }

          if (!Array.isArray(question.choices)) {
            throw new Error("Invalid format: Choices must be an array");
          }

          return {
            type: question.type,
            question: question.question,
            choices: question.choices,
            answer: question.answer,
            id: questionCounter + Math.random(),
          };
        });

        // Add validated questions to the section
        setQuestionsBySectionId((prev: any) => ({
          ...prev,
          [currentSectionId]: [
            ...(prev[currentSectionId] || []),
            ...validatedQuestions,
          ],
        }));

        // Update question counter
        setQuestionCounter((prev) => prev + validatedQuestions.length);

        toast.setToastData({
          title: `${validatedQuestions.length} questions added successfully!`,
          type: "success",
        });
      } catch (error) {
        console.error("Error processing questions:", error);
        toast.setToastData({
          title:
            error instanceof Error
              ? error.message
              : "Failed to process questions",
          type: "error",
        });
      }
    },
    [
      addToast,
      currentSectionId,
      questionCounter,
      setQuestionCounter,
      setQuestionsBySectionId,
    ]
  );

  const {
    defaultValues,
    setDefaultValues,
    setIsCollectionModalOpen,
    setIsAddCardModalOpen,
  } = useModalsStates();

  const submitHandler = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const values = Object.fromEntries(formData) as object;
      const name = formData.get("section_name") as string;
      const description = formData.get("section_description") as string;

      const entries = Object.entries(values);

      let data: any = {
        name: name,
        description: description,
        type: sectionType,
        content: {
          text: editor?.getHTML(),
          questions: [],
          resources: resources, // Add the resources array to the data object
        },
      };
      let questionObj = {
        type: "",
        question: "",
        choices: [],
        answer: "",
        id: Math.random(),
      };

      // Use the questions from the current section
      if (questionsBySectionId && questionsBySectionId[currentSectionId]) {
        // Process form data for the current section's questions
        entries.forEach((entry: [string, string]) => {
          const number = entry[0].split("-")[0];

          if (entry[0].split("-")[1] === "question") {
            questionObj = {
              type: "",
              question: "",
              choices: [],
              answer: "",
              id: Math.random(),
            };
          }

          if (Number.isInteger(+number)) {
            const type = entry[0].split("-");
            if (type.length === 4) {
              questionObj.type = type[2];
            }

            if (entry[0].split("-")[1] === "question") {
              questionObj.question = entry[1];
            } else if (entry[0].split("-")[1].includes("choice")) {
              const choice = entry[1];
              questionObj.choices.push(choice as never);
            } else if (entry[0].split("-")[1] === "answer") {
              questionObj.answer = entry[1];
            }
            if (entry[0].split("-")[1] === "question") {
              data.content.questions.push(questionObj);
            }
          }
        });
      }

      if (data.type !== "text") {
        delete data.content.text;
      }

      if (copy) {
        try {
          navigator.clipboard.write(data.content.questions);
        } catch (err) {
          console.log(err);
        }
        console.log(data.content.questions);
        return;
      }

      const toast = addToast("Updating Section..", "promise");

      try {
        await axios.patch(`section/${editId}`, data);
        queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
        toast.setToastData({ title: "Section Updated!", type: "success" });
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        console.error(err);
        toast.setToastData({
          title: "Failed To Update Section",
          type: "error",
        });
      }
    },
    [
      addToast,
      copy,
      currentSectionId,
      editId,
      editor,
      lessonId,
      questionsBySectionId,
      queryClient,
      resources,
      sectionType,
    ]
  );

  const deleteQuestionHandler = React.useCallback(
    (id: number) => {
      if (!currentSectionId) return;

      setQuestionsBySectionId((prev: any) => {
        const updatedQuestions = {
          ...prev,
          [currentSectionId]:
            prev[currentSectionId]?.filter(
              (question: any) => question.id !== id
            ) || [],
        };
        return updatedQuestions;
      });
    },
    [currentSectionId, setQuestionsBySectionId]
  );

  const reorderSectionsHandler = React.useCallback(
    (arrangedSections: sectionType[]) => {
      const sectionsData = arrangedSections.map((section) => {
        return { _id: section._id, order: section.order };
      });

      axios
        .put("/section/update-order", { sections: sectionsData })
        .then((res) => console.log("res", res));
    },
    []
  );

  // Only update resources when section changes
  useEffect(() => {
    setResources(section.content?.resources || []);
  }, [section]);

  const handleAddCard = React.useCallback(() => {
    setEditId("");
    setDefaultValues({ sectionId: section._id });
    setIsAddCardModalOpen(true);
  }, [section._id, setDefaultValues, setEditId, setIsAddCardModalOpen]);

  const handleEditCard = React.useCallback(
    (card: any) => {
      setEditId(card._id);
      setDefaultValues(card);
      setIsAddCardModalOpen(true);
    },
    [setDefaultValues, setEditId, setIsAddCardModalOpen]
  );

  const handleDeleteCard = React.useCallback(
    async (cardId: string) => {
      const toast = addToast("Deleting Card..", "promise");
      try {
        await axios.delete(`card/${cardId}`);
        queryClient.invalidateQueries({
          queryKey: ["cards", "section", section._id],
        });
        toast.setToastData({ title: "Card Deleted!", type: "success" });
      } catch (err) {
        console.error(err);
        toast.setToastData({ title: "Failed To Delete Card", type: "error" });
      }
    },
    [addToast, queryClient, section._id]
  );

  const handleAddCollection = React.useCallback(() => {
    setEditId("");
    setDefaultValues({ sectionId: section._id });
    setIsCollectionModalOpen(true);
  }, [section._id, setDefaultValues, setEditId, setIsCollectionModalOpen]);

  const handleEditCollection = React.useCallback(
    (collection: any) => {
      setEditId(collection._id);
      setDefaultValues(collection);
      setIsCollectionModalOpen(true);
    },
    [setDefaultValues, setEditId, setIsCollectionModalOpen]
  );

  const handleDeleteCollection = React.useCallback(
    async (collectionId: string) => {
      const toast = addToast("Deleting Collection..", "promise");
      try {
        await axios.delete(`collection/${collectionId}`);
        queryClient.invalidateQueries({
          queryKey: ["collections", "section", section._id],
        });
        toast.setToastData({ title: "Collection Deleted!", type: "success" });
      } catch (err) {
        console.error(err);
        toast.setToastData({
          title: "Failed To Delete Collection",
          type: "error",
        });
      }
    },
    [addToast, queryClient, section._id]
  );

  // Memoize the toggle expand handler
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modified toggle handler to open modal instead of expanding section
  const handleToggleExpand = React.useCallback(() => {
    setIsModalOpen(true);
    setCurrentSectionId(section._id);
  }, [section._id]);

  // Only fetch section notes data when modal is open
  const { data: sectionNotes } = useGetSectionNotes(
    isModalOpen ? section._id : null
  );

  return (
    <div key={section._id}>
      <DragableComponent
        reorderHandler={reorderSectionsHandler}
        setState={setArrangedSections}
        state={arrangedSections}
        order={index + 1}
      >
        <SectionHeader
          sectionId={section._id}
          sectionName={section.name}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
      </DragableComponent>

      <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} big>
        <Modal.Header title={section.name} setIsOpen={setIsModalOpen} />
        <div className="px-6">
          {isModalOpen && (
            <Suspense
              fallback={
                <div className="py-4 text-center">Loading section form...</div>
              }
            >
              <SectionFormLazy
                key={section._id}
                editor={editor}
                section={section}
                sectionType={sectionType}
                setSectionType={setSectionType}
                onSubmit={(e) => {
                  submitHandler(e);
                  setIsModalOpen(false);
                }}
                setEditId={setEditId}
                questionsBySectionId={questionsBySectionId}
                deleteQuestionHandler={deleteQuestionHandler}
                showQuestionDropdown={showQuestionDropdown}
                setShowQuestionDropdown={setShowQuestionDropdown}
                addQuestionHandler={addQuestionHandler}
                handlePasteContent={handlePasteContent}
                resources={resources}
                setResources={setResources}
                setContent={setContent}
                onCopy={() => {
                  setEditId(section._id);
                  setCopy(true);
                }}
              />
            </Suspense>
          )}

          {isModalOpen && (
            <Suspense
              fallback={
                <div className="py-4 text-center">Loading cards...</div>
              }
            >
              <AdminSectionCards sectionId={section._id} />
            </Suspense>
          )}

          {isModalOpen && sectionNotes && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Section Notes</h3>
                <Button
                  onClick={() =>
                    navigate(`/notes/new?sectionId=${section._id}`)
                  }
                  className="flex gap-2 items-center"
                >
                  <Plus size={20} />
                  Add Note
                </Button>
              </div>
              <div className="grid gap-4 grid-container">
                {sectionNotes?.map((note: any) => (
                  <div
                    key={note._id}
                    onClick={() => navigate(`/notes/edit/${note._id}`)}
                  >
                    <ItemCard
                      isNotes={true}
                      select={false}
                      isSameUser={true}
                      id={note._id}
                      Icon={<StickyNote />}
                      name={note.title}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(AdminSectionComponent);
