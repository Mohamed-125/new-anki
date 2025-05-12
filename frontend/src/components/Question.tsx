import { QuestionType } from "@/pages/LessonPage";
import { CheckCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import ShortcutKey from "./ShortcutKey";

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
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentQuestion?.type !== "choose" || feedbackMessage) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        if (currentQuestion?.choices) {
          const answer = document.getElementById(
            currentQuestion?.choices[num - 1]
          );
          answer?.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestion, feedbackMessage]);

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
                parentSetIsAnswerCorrect={setIsAnswerCorrect}
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
          className={`flex justify-between items-center p-4 mt-6 rounded-xl border-2 transition-all duration-300 ${
            isAnswerCorrect
              ? "text-green-700 bg-green-50 border-green-500"
              : "text-red-700 bg-red-50 border-red-500"
          }`}
        >
          <div className="flex gap-3 items-center">
            <div
              className={`p-2 rounded-full ${
                isAnswerCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isAnswerCorrect ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="font-medium">{feedbackMessage}</p>
              {!isAnswerCorrect && currentQuestion.answer && (
                <p className="mt-1 text-sm text-gray-600">
                  Correct answer: {currentQuestion.answer}
                </p>
              )}
            </div>
          </div>
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
  parentSetIsAnswerCorrect: React.Dispatch<
    React.SetStateAction<boolean | null>
  >;
};

const Choice = ({
  choice,
  index,
  currentQuestion,
  setFeedbackMessage,
  feedbackMessage,
  setIsAnswered,
  parentSetIsAnswerCorrect,
}: ChoiceProps) => {
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Reset state when question changes
  // useEffect(() => {
  //   setIsAnswerCorrect(null);
  // }, [currentQuestion.id]); // Add dependency on question ID

  // Handle answer selection
  const successMessages = [
    "Great job!",
    "You're on fire!",
    "Amazing work!",
    "Fantastic!",
    "Keep it up!",
    "You're crushing it!",
    "Brilliant!",
    "Well done!",
  ];

  const handleAnswerSelect = (answer: string) => {
    // Check if this is a new answer (not previously answered)

    // Check if the answer is correct
    const a = currentQuestion?.choices?.[+currentQuestion?.answer - 1];
    const correct = answer === a;

    setIsAnswerCorrect(correct);
    parentSetIsAnswerCorrect(correct);
    setIsAnswered(true);
    // Set feedback message
    if (correct) {
      const randomMessage =
        successMessages[Math.floor(Math.random() * successMessages.length)];
      setFeedbackMessage(randomMessage);
    } else {
      setFeedbackMessage(`Incorrect. The correct answer is: ${a}`);
    }
  };

  return (
    <div
      key={currentQuestion.id || Math.random()}
      id={choice}
      className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 relative ${
        isAnswerCorrect !== null
          ? isAnswerCorrect
            ? "bg-green-50 border-green-500 shadow-lg"
            : "bg-red-50 border-red-500 shadow-lg"
          : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md"
      } ${
        feedbackMessage
          ? "cursor-not-allowed"
          : "hover:transform hover:scale-[1.01]"
      }`}
      onClick={() => (feedbackMessage ? null : handleAnswerSelect(choice))}
    >
      <div className="flex gap-4 items-center">
        <span className="flex justify-center items-center w-6 h-6 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
          {index + 1}
        </span>
        {choice}
      </div>
    </div>
  );
};

export default Question;
