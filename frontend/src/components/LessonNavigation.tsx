import React, { useEffect } from "react";
import Button from "./Button";
import { QuestionType } from "@/pages/LessonPage";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { sectionType } from "@/hooks/Queries/useSectionMutations";
import { LessonType } from "@/hooks/Queries/useLessonMutations";
import { promises } from "dns";
import ShortcutKey from "./ShortcutKey";

interface LessonNavigationProps {
  setCurrentSectionIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  sections: sectionType[];
  currentSection: { content: { questions: QuestionType[] }; type: string };
  length: number;
  moves: number;
  setMoves: React.Dispatch<React.SetStateAction<number>>;
  isAnswered: boolean;
  setIsAnswered: React.Dispatch<React.SetStateAction<boolean>>;
  currentQuestion: QuestionType;
  CheckAnswerHandler: () => void;
  setFeedbackMessage: React.Dispatch<React.SetStateAction<string | null>>;
  textAnswer: string;
  courseLevelId?: string;
  lesson: LessonType | undefined;
}

const LessonNavigation = ({
  setCurrentSectionIndex,
  setCurrentQuestionIndex,
  currentSectionIndex,
  currentQuestionIndex,
  sections,
  currentSection,
  length,
  moves,
  setMoves,
  isAnswered,
  setIsAnswered,
  currentQuestion,
  CheckAnswerHandler,
  setFeedbackMessage,
  textAnswer,
  lesson,
  courseLevelId,
}: LessonNavigationProps) => {
  const lessonId = lesson?._id;

  const goToPre = () => {
    setMoves((pre) => pre - 1);
    setIsAnswered(false);
    setFeedbackMessage(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((pre) => pre - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex((pre) => pre - 1);
      const previousSection = sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(
        previousSection.content?.questions?.length - 1 || 0
      );
    }
  };

  const goToNext = () => {
    setIsAnswered(false);
    setFeedbackMessage(null);
    setMoves((pre) => pre + 1);
    if (currentQuestionIndex < currentSection.content?.questions?.length - 1) {
      setCurrentQuestionIndex((pre) => pre + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((pre) => pre + 1);
      setCurrentQuestionIndex(0);
      if (currentSection.type === "excercises") {
      }
    }
  };

  //   useEffect(() => {
  //
  //   }, [currentQuestionIndex]);

  let isDisabled;

  if (currentSection?.type === "excercises") {
    if (currentQuestion.type === "choose") {
      isDisabled = !isAnswered;
    } else {
      isDisabled = !textAnswer;
    }
  } else {
    isDisabled = false;
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isDisabled) {
          if (moves !== length - 1) {
            if (currentSection.type === "excercises") {
              if (currentQuestion.type !== "text") {
                goToNext();
              } else if (!isAnswered) {
                CheckAnswerHandler();
              } else {
                goToNext();
              }
            } else {
              goToNext();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [moves, length, currentSection, currentQuestion, isAnswered, isDisabled]);
  const queryClient = useQueryClient();
  return (
    <div className="flex fixed right-0 bottom-0 left-0 z-50 justify-center w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex justify-between items-center px-6 py-2 mx-auto max-w-4xl">
        <Button
          onClick={goToPre}
          disabled={currentSectionIndex === 0}
          className="flex gap-2 items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Previous
        </Button>

        <Button
          onClick={() => {
            if (moves !== length - 1) {
              if (currentSection.type === "excercises") {
                if (currentQuestion.type !== "text") {
                  goToNext();
                } else if (!isAnswered) {
                  CheckAnswerHandler();
                } else {
                  goToNext();
                }
              } else {
                goToNext();
              }
            } else {
              // Fork collections and notes before marking lesson as complete
              if (!lesson?.isCompleted) {
                const forkPromises = sections.flatMap((section) => {
                  const promises = [];

                  // Fork collections if they exist
                  if (section.collections?.length > 0) {
                    promises.push(
                      ...section.collections.map((collection) =>
                        axios.post(`/collection/fork/${collection._id}`)
                      )
                    );
                  }

                  // Fork notes if they exist
                  if (section.notes?.length > 0) {
                    promises.push(
                      ...section.notes.map((note) =>
                        axios.post(`/note/fork/${note._id}`)
                      )
                    );
                  }

                  return promises;
                });

                // After forking is complete, mark the lesson as complete
                Promise.all(forkPromises)
                  .then(() => {
                    const body = { lessonId } as {
                      lessonId: string;
                      courseLevelId?: string;
                    };
                    if (courseLevelId) body.courseLevelId = courseLevelId;
                    return axios.post("/progress", body);
                  })
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: ["cards"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["collections"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["courseLevel", courseLevelId],
                    });
                  })
                  .catch((error) => {
                    console.error("Error forking content:", error);
                  });
              } else {
                const body = { lessonId } as {
                  lessonId: string;
                  courseLevelId?: string;
                };
                if (courseLevelId) body.courseLevelId = courseLevelId;
                axios.post("/progress", body).then(() => {
                  queryClient.invalidateQueries({
                    queryKey: ["courseLevel", courseLevelId],
                  });
                });
              }
            }
          }}
          disabled={isDisabled}
          className={`flex gap-2 items-center px-6 relative py-3 rounded-lg transition-all ${
            moves === length - 1
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {/* <ShortcutKey text="Enter" /> */}

          <NextBtn
            currentSection={currentSection}
            moves={moves}
            length={length}
            isAnswered={isAnswered}
            currentQuestion={currentQuestion}
          />
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
      <div className="absolute right-0 left-0 bottom-full w-full bg-gray-100">
        <div
          className="h-1 bg-green-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.round((moves / length) * 100)}%` }}
        />
      </div>
    </div>
  );
};

interface NextBtnProps {
  currentSection: { content: { questions: QuestionType[] }; type: string };
  moves: number;
  length: number;
  isAnswered: boolean;
  currentQuestion: QuestionType;
}

const NextBtn = ({
  currentSection,
  moves,
  length,
  isAnswered,
  currentQuestion,
}: NextBtnProps) => {
  let buttonText = "";

  if (moves !== length - 1) {
    if (currentSection?.type === "excercises") {
      if (currentQuestion.type === "text") {
        if (isAnswered) {
          buttonText = "Next";
        } else {
          buttonText = "Check Answer";
        }
      } else {
        buttonText = "Next";
      }
    } else {
      buttonText = "Next";
    }
  } else {
    buttonText = "Finish Lesson";
  }

  return <div className="relative">{buttonText}</div>;
};

export default LessonNavigation;
