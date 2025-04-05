import { QuestionType } from "@/pages/LessonPage";
import { CheckCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import Button from "./Button";

interface QuestionProps {
  currentQuestion: QuestionType;
  CheckAnswerHandler?: () => void;
  textAnswer: string;
  setTextAnswer: React.Dispatch<React.SetStateAction<string>>;
  setFeedbackMessage: React.Dispatch<React.SetStateAction<string | null>>;
  feedbackMessage: string | null;
  setIsAnswered: React.Dispatch<React.SetStateAction<boolean>>;
}

const Question = ({
  currentQuestion,
  textAnswer,
  setTextAnswer,
  setFeedbackMessage,
  feedbackMessage,
  setIsAnswered,
}: QuestionProps) => {
  return (
    <div>
      {currentQuestion?.type === "choose" && currentQuestion?.choices && (
        <div className="space-y-3">
          {currentQuestion.choices.map((choice, index) => {
            return (
              <Choice
                key={`${currentQuestion.id}-${index}`}
                choice={choice}
                feedbackMessage={feedbackMessage}
                index={index}
                currentQuestion={currentQuestion}
                setFeedbackMessage={setFeedbackMessage}
                setIsAnswered={setIsAnswered}
              />
            );
          })}
        </div>
      )}
      {/* Text input question */}
      {currentQuestion?.type === "text" && (
        <TextQuestion textAnswer={textAnswer} setTextAnswer={setTextAnswer} />
      )}

      {feedbackMessage && (
        <div
          className={`flex justify-between items-center px-3 py-3 mt-6  rounded-md ${
            feedbackMessage.includes("Correct") ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <div
            className={`flex gap-2 items-center ${
              feedbackMessage.includes("Correct")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {feedbackMessage.includes("Correct") ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            {feedbackMessage}
          </div>
          {/* {currentQuestionIndex <
                    currentSection.content.questions.length - 1 ? ( */}
          {/* <Button onClick={goToNextQuestion}>Next</Button> */}
          {/* ) : null} */}
        </div>
      )}
    </div>
  );
};
type TextQuestionProps = {
  textAnswer: string;
  setTextAnswer: React.Dispatch<React.SetStateAction<string>>;
};

const TextQuestion = ({ textAnswer, setTextAnswer }: TextQuestionProps) => {
  return (
    <div className="mt-4">
      <input
        type="text"
        className="p-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your answer here"
        onChange={(e) => setTextAnswer(e.target.value)}
        value={textAnswer}
      />
    </div>
  );
};

type ChoiceProps = {
  choice: string;
  index: number;
  currentQuestion: QuestionType;
  setFeedbackMessage: React.Dispatch<React.SetStateAction<string | null>>;
  feedbackMessage: string | null;
  setIsAnswered: React.Dispatch<React.SetStateAction<boolean>>;
};

const Choice = ({
  choice,
  currentQuestion,
  setFeedbackMessage,
  feedbackMessage,
  setIsAnswered,
}: ChoiceProps) => {
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Reset state when question changes
  // useEffect(() => {
  //   setIsAnswerCorrect(null);
  // }, [currentQuestion.id]); // Add dependency on question ID

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    // Check if this is a new answer (not previously answered)

    // Check if the answer is correct
    const a = currentQuestion?.choices?.[+currentQuestion?.answer - 1];
    const correct = answer === a;

    setIsAnswerCorrect(correct);
    setIsAnswered(true);
    // Set feedback message
    if (correct) {
      setFeedbackMessage("Correct! Well done.");
    } else {
      setFeedbackMessage("Incorrect");
    }
  };

  return (
    <div
      key={currentQuestion.id}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isAnswerCorrect !== null
          ? isAnswerCorrect
            ? "bg-green-50 border-green-500 shadow-md"
            : "bg-red-50 border-red-500 shadow-md"
          : "bg-gray-500"
      }`}
      onClick={() => (feedbackMessage ? null : handleAnswerSelect(choice))}
    >
      {isAnswerCorrect}
      {choice}
    </div>
  );
};

export default Question;

type QuestionNavigationProps = {
  currentQuestionIndex: number;
  currentSection: { content: { questions: QuestionType[] } };
  currentSectionIndex: number;
  sectionsLength: number;
  goToPreviousSection: () => void;
  goToNextQuestion: () => void;
  currentQuestion: QuestionType;
};

const QuestionNavigation = ({
  currentSectionIndex,
  goToPreviousSection,
  goToNextQuestion,
  currentQuestion,
}: QuestionNavigationProps) => {
  return (
    <div className={`flex justify-between items-center mt-6`}>
      <p>question Navigation</p>

      <Button
        onClick={goToPreviousSection}
        className="flex gap-2 justify-self-start items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-200"
        disabled={currentSectionIndex === 0}
      >
        <ChevronLeft className="h-5 5" />
        Previous
      </Button>

      <>
        {currentQuestion.type === "text" ? (
          <Button
            onClick={() => {
              goToNextQuestion();
            }}
            className={`flex gap-2 items-center px-4 py-2 text-white bg-green-500 rounded-lg shadow-sm duration-200 hover:bg-green-600`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button onClick={goToNextQuestion}>Next</Button>
        )}
      </>
    </div>
  );
};
