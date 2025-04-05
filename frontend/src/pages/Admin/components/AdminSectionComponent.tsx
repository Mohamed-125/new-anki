import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useToasts from "@/hooks/useToasts";
import { sectionType } from "@/hooks/Queries/useSectionMutations";
import DragableComponent from "@/components/DraggableComponent";
import SectionHeader from "./SectionHeader";
import SectionForm from "./SectionForm";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import { useQueryClient } from "@tanstack/react-query";
import useUseEditor from "@/hooks/useUseEditor";

interface AdminSectionComponentProps {
  section: any; // The section data
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

  const addQuestionHandler = (type: "choose" | "text") => {
    if (!currentSectionId) return;

    setQuestionsBySectionId((prev: any) => ({
      ...prev,
      [currentSectionId]: [
        ...(prev[currentSectionId] || []),
        { type, id: questionCounter },
      ],
    }));
    setQuestionCounter((prev) => prev + 1);
  };

  const queryClient = useQueryClient();

  const [resources, setResources] = useState<
    Array<{ type: "audio" | "video"; id: number; url: string }>
  >([]);

  const [copy, setCopy] = useState(false);
  const [addContentTab, setAddContentTab] = useState(false);
  const [pasteContent, setPasteContent] = useState("");

  const handlePasteContent = () => {
    try {
      const parsedContent = JSON.parse(pasteContent);
      if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        const validQuestions = parsedContent
          .filter(
            (q) =>
              q.type &&
              (q.type === "choose" || q.type === "text") &&
              q.question &&
              ((q.type === "choose" &&
                Array.isArray(q.choices) &&
                q.choices.length === 4) ||
                (q.type === "text" && q.answer))
          )
          .map((q) => ({ ...q, id: questionCounter + Math.random() }));

        if (validQuestions.length > 0 && currentSectionId) {
          setQuestionsBySectionId((prev: any) => ({
            ...prev,
            [currentSectionId]: [
              ...(prev[currentSectionId] || []),
              ...validQuestions,
            ],
          }));
          setQuestionCounter((prev) => prev + validQuestions.length);
          setPasteContent("");
          addToast("Questions added successfully!", "success");
        } else {
          addToast("No valid questions found in the pasted content", "error");
        }
      } else {
        addToast("Please paste a valid array of questions", "error");
      }
    } catch (err) {
      addToast("Invalid JSON format", "error");
      console.error(err);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
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
      entries.map((entry: [string, string]) => {
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
    } finally {
      // setIsLoading(false);
    }
  };

  const deleteQuestionHandler = (id: number) => {
    console.log(id);
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
  };

  const { editor } = useUseEditor();

  const reorderSectionsHandler = (arrangedSections: sectionType[]) => {
    const sectionsData = arrangedSections.map((section) => {
      return { _id: section._id, order: section.order };
    });

    axios
      .put("/section/update-order", { sections: sectionsData })
      .then((res) => console.log("res", res));
  };

  useEffect(() => {
    setResources(section.content?.resources || []);
  }, [section]);

  return (
    <DragableComponent
      reorderHandler={reorderSectionsHandler}
      key={section._id}
      setState={setArrangedSections}
      state={arrangedSections}
      order={index + 1}
    >
      <SectionHeader
        sectionId={section._id}
        sectionName={section.name}
        isExpanded={expandedSections.includes(section._id)}
        onToggleExpand={() => {
          setExpandedSections((prev) =>
            prev.includes(section._id)
              ? prev.filter((_id) => _id !== section._id)
              : [...prev, section._id]
          );
          setCurrentSectionId(section._id);
        }}
      />

      <div
        className={`transition-all pb-0 duration-300 ease-in-out ${
          expandedSections.includes(section._id)
            ? "opacity-100 pb-24"
            : "opacity-0 max-h-0 pb-0 overflow-hidden"
        }`}
      >
        <SectionForm
          section={section}
          sectionType={sectionType}
          setSectionType={setSectionType}
          onSubmit={submitHandler}
          setEditId={setEditId}
          questionsBySectionId={questionsBySectionId}
          deleteQuestionHandler={deleteQuestionHandler}
          showQuestionDropdown={showQuestionDropdown}
          setShowQuestionDropdown={setShowQuestionDropdown}
          addQuestionHandler={addQuestionHandler}
          handlePasteContent={handlePasteContent}
          resources={resources}
          setResources={setResources}
          onCopy={() => {
            setEditId(section._id);
            setCopy(true);
          }}
        ></SectionForm>

        {/* <div className="p-4">
                 <p className="text-gray-600">{section.content}</p>
                 {section.audio && (
                   <audio controls className="mt-4 w-full">
                     <source src={section.audio} type="audio/mpeg" />
                   </audio>
                 )}
                 {section.video && (
                   <video controls className="mt-4 w-full">
                     <source src={section.video} type="video/mp4" />
                   </video>
                 )}
               </div> */}
      </div>
    </DragableComponent>
  );
};

export default AdminSectionComponent;
