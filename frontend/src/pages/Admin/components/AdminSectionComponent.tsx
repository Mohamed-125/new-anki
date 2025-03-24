import React, { ReactNode, useEffect, useState } from "react";
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

interface AdminSectionComponentProps {
  section: any; // The section data
  expandedSections: string[];
  setExpandedSections: React.Dispatch<React.SetStateAction<string[]>>;
  setSectionType: React.Dispatch<React.SetStateAction<string>>;
  showQuestionDropdown: boolean;
  setShowQuestionDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  questionsBySectionId?: Record<string, any[]>;
  setQuestionsBySectionId: any;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  setIsSectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultValues: React.Dispatch<React.SetStateAction<any>>;
  sectionType?: string;
  editId: string;
  questionCounter: number;
  setQuestionCounter: React.Dispatch<React.SetStateAction<number>>;
}

const AdminSectionComponent = ({
  section,
  expandedSections,
  setExpandedSections,
  setSectionType,
  showQuestionDropdown,
  setShowQuestionDropdown,
  questionsBySectionId = {},
  setEditId,
  setIsSectionModalOpen,
  setDefaultValues,
  setQuestionsBySectionId,
  questionCounter,
  editId,

  setQuestionCounter,

  sectionType,
}: AdminSectionComponentProps) => {
  const { addToast } = useToasts();
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const { lessonId } = useParams();

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

    console.log(data);

    const toast = addToast("Updating Section..", "promise");

    try {
      await axios.patch(`section/${editId}`, data);
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      toast.setToastData({ title: "Section Updated!", isCompleted: true });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({
        title: "Failed To Update Section",
        isError: true,
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

  const addResourceHandler = (type: "audio" | "video") => {
    setResources((prev) => [...prev, { type, id: Date.now(), url: "" }]);
  };

  const deleteResourceHandler = (id: number) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const updateResourceUrl = (id: number, url: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, url } : r)));
  };

  const { editor } = useUseEditor();

  return (
    <div
      key={section._id}
      className="overflow-hidden relative pb-32 bg-white shadow-md"
    >
      <div className="p-6 text-white bg-blue-500 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              setExpandedSections((prev) =>
                prev.includes(section._id)
                  ? prev.filter((_id) => _id !== section._id)
                  : [...prev, section._id]
              );
              setCurrentSectionId(section._id);
            }}
          >
            <div className="flex gap-2 items-center">
              {expandedSections.includes(section._id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
              <h2 className="text-2xl font-semibold">{section.name}</h2>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <ActionsDropdown
              itemId={section._id}
              editHandler={() => {
                setEditId(section._id);
                setDefaultValues({
                  sectionName: section.name,
                  description: section.content,
                });
                setIsSectionModalOpen(true);
              }}
              deleteHandler={async () => {
                try {
                  await axios.delete(`section/${section._id}`);
                  const queryClient = useQueryClient();
                  const { lessonId } = useParams();
                  queryClient.invalidateQueries({
                    queryKey: ["lesson", lessonId],
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          expandedSections.includes(section._id)
            ? "opacity-100"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <>
          <select onChange={(e) => setSectionType(e.target.value)}>
            <option value={"text"} selected>
              Text
            </option>
            <option value={"excercises"}>Excercises</option>
            <option value={"resources"}>Resources</option>
          </select>
          {sectionType}
          <Form onSubmit={submitHandler}>
            <Form.FieldsContainer>
              <Form.Field>
                <Form.Label>section Name</Form.Label>
                <Form.Input
                  defaultValue={section.name}
                  required
                  name="section_name"
                ></Form.Input>
              </Form.Field>
              <Form.Field>
                <Form.Label>section Description</Form.Label>
                <Form.Input
                  required
                  defaultValue={section.description}
                  name="section_description"
                ></Form.Input>
              </Form.Field>
              <Form.Field>
                <Form.Label>Section Audio</Form.Label>
                <Form.Input name="audio"></Form.Input>
              </Form.Field>
              <Form.Field className="mb-6">
                <Form.Label>Section Video</Form.Label>
                <Form.Input name="video"></Form.Input>
              </Form.Field>
            </Form.FieldsContainer>
            {sectionType === "text" && (
              <Form.Field className="mb-5">
                <Form.Label>Section Content</Form.Label>
                <TipTapEditor editor={editor} />
              </Form.Field>
            )}

            {sectionType === "resources" && (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">
                          {resource.type.charAt(0).toUpperCase() +
                            resource.type.slice(1)}{" "}
                          URL
                        </h3>
                        <button
                          onClick={() => deleteResourceHandler(resource.id)}
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="url"
                        name={`resource-${resource.id}-${resource.type}`}
                        placeholder={`Enter ${resource.type} URL`}
                        value={resource.url}
                        onChange={(e) =>
                          updateResourceUrl(resource.id, e.target.value)
                        }
                        className="px-3 py-2 w-full rounded-md border"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => addResourceHandler("audio")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Add Audio URL
                  </button>
                  <button
                    type="button"
                    onClick={() => addResourceHandler("video")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Add Video URL
                  </button>
                </div>
              </div>
            )}
            {sectionType === "excercises" && (
              <div className="">
                {(questionsBySectionId[section._id] || []).map(
                  (question, n) => {
                    console.log(question);
                    return (
                      <div key={question.id} id={question.id} className="mb-6">
                        {question.type === "choose" ? (
                          <div className="px-3 py-5 bg-gray-100 rounded-md">
                            <div className="flex justify-between items-center mb-5">
                              <h3 className="mb-2 text-lg font-medium">
                                {n + 1} - Choose Question
                              </h3>
                              <button
                                onClick={() =>
                                  deleteQuestionHandler(question.id)
                                }
                                type="button"
                                className="flex gap-1 items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                              >
                                <Trash />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Question"
                              required
                              defaultValue={question.question}
                              name={`${n + 1}-question-choose-${question.id}`}
                              className="px-3 py-2 mb-4 w-full rounded-md border"
                            />
                            <div className="flex gap-4 items-center mb-4">
                              <div className="flex-1">
                                <div className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300">
                                  <input
                                    type="radio"
                                    defaultChecked={+question.answer === 1}
                                    required
                                    value={1}
                                    name={`${n + 1}-answer-${question.id}`}
                                    className="w-5 h-5"
                                  ></input>
                                  <input
                                    type="text"
                                    defaultValue={question?.choices?.[0]}
                                    name={`${n + 1}-choice1-${question.id}`}
                                    placeholder="Choice 1"
                                    required
                                    className="px-3 py-2 mb-2 w-full bg-transparent rounded-md border border-none"
                                  />
                                </div>

                                <div className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300">
                                  <input
                                    type="radio"
                                    defaultChecked={+question.answer === 2}
                                    required
                                    value={2}
                                    name={`${n + 1}-answer-${question.id}`}
                                    className="w-5 h-5"
                                  ></input>

                                  <input
                                    type="text"
                                    name={`${n + 1}-choice2-${question.id}`}
                                    defaultValue={question?.choices?.[1]}
                                    placeholder="Choice 2"
                                    required
                                    className="px-3 py-2 w-full bg-transparent rounded-md border border-none"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300">
                                  <input
                                    type="radio"
                                    defaultChecked={+question.answer === 3}
                                    required
                                    value={3}
                                    name={`${n + 1}-answer-${question.id}`}
                                    className="w-5 h-5"
                                  ></input>

                                  <input
                                    type="text"
                                    name={`${n + 1}-choice3-${question.id}`}
                                    defaultValue={question?.choices?.[2]}
                                    placeholder="Choice 3"
                                    required
                                    className="px-3 py-2 mb-2 w-full bg-transparent rounded-md border border-none"
                                  />
                                </div>
                                <div className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300">
                                  <input
                                    type="radio"
                                    defaultChecked={+question.answer === 4}
                                    required
                                    value={4}
                                    name={`${n + 1}-answer-${question.id}`}
                                    className="w-5 h-5"
                                  ></input>

                                  <input
                                    type="text"
                                    name={`${n + 1}-choice4-${question.id}`}
                                    defaultValue={question?.choices?.[3]}
                                    placeholder="Choice 4"
                                    required
                                    className="px-3 py-2 w-full bg-transparent rounded-md border border-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-5">
                              <h3 className="mb-2 text-lg font-medium">
                                {n + 1} - Text Question
                              </h3>
                              <button
                                onClick={() =>
                                  deleteQuestionHandler(question.id)
                                }
                                type="button"
                                className="flex gap-1 items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                              >
                                <Trash />
                              </button>
                            </div>

                            <input
                              type="text"
                              name={`${n + 1}-question-text-${question.id}`}
                              defaultValue={question.question}
                              placeholder="Question"
                              required
                              className="px-3 py-2 mb-4 w-full rounded-md border"
                            />
                            <textarea
                              name={`${n + 1}-answer-${question.id}`}
                              placeholder="Answer"
                              required
                              defaultValue={question.answer}
                              className="px-3 py-2 w-full rounded-md border"
                              rows={4}
                            ></textarea>
                          </>
                        )}
                      </div>
                    );
                  }
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <button
                    onClick={() =>
                      setShowQuestionDropdown(!showQuestionDropdown)
                    }
                    type="button"
                    className="grid place-items-center mx-auto w-10 h-10 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon />{" "}
                  </button>
                  {showQuestionDropdown && (
                    <div className="absolute left-3 bottom-12 z-10 mt-2 w-36 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg">
                      <div className="py-1" role="menu">
                        <button
                          className="block px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            addQuestionHandler("choose");
                            setShowQuestionDropdown(false);
                          }}
                        >
                          Choose Question
                        </button>
                        <button
                          className="block px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            addQuestionHandler("text");
                            setShowQuestionDropdown(false);
                          }}
                        >
                          Text Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button
              onClick={() => {
                setEditId(section._id);
              }}
            >
              Save
            </Button>
          </Form>
        </>

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
    </div>
  );
};

export default AdminSectionComponent;
