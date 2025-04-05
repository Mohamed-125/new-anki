import React, { useEffect } from "react";
import Button from "./Button";
import { QuestionType } from "@/pages/LessonPage";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface LessonNavigationProps {
  setCurrentSectionIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  sections: Array<{ content: { questions: QuestionType[] }; type: string }>;
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
  lessonId: string;
  courseLevelId: string;
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
  lessonId,
  courseLevelId,
}: LessonNavigationProps) => {
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

  const queryClient = useQueryClient();
  return (
    <div className="px-2 py-3 mt-5 bg-white rounded-lg shadow-md">
      <Button onClick={goToPre} disabled={currentSectionIndex === 0}>
        Pre
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
            axios
              .post("/progress", { courseLevelId, lessonId })
              .then(() =>
                queryClient.invalidateQueries({
                  queryKey: ["courseLevel", courseLevelId],
                })
              );
          }
        }}
        disabled={isDisabled}
      >
        <NextBtn
          currentSection={currentSection}
          moves={moves}
          length={length}
          isAnswered={isAnswered}
          currentQuestion={currentQuestion}
        />
      </Button>
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

  return <p>{buttonText}</p>;
};

export default LessonNavigation;
