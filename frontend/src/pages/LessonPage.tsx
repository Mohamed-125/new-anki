import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGetLesson from "../hooks/Queries/useGetLesson";
import useGetSections from "../hooks/Queries/useGetSections";
import {
  Book,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Button from "@/components/Button";

type QuestionType = {
  id: number;
  type: "choose" | "text";
  question: string;
  choices?: string[];
  answer: string;
};

const LessonPage = () => {
  const { lessonId, courseId, courseLevelId } = useParams<{
    lessonId: string;
    courseId: string;
    courseLevelId: string;
  }>();
  const navigate = useNavigate();

  // State for tracking current section and question
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  // Using a Set to track unique viewed question IDs
  const [viewedQuestions, setViewedQuestions] = useState<number[]>([]);

  // Fetch lesson data
  const { data: lesson, isLoading: isLessonLoading } = useGetLesson(
    lessonId as string
  );

  // Fetch sections data
  const {
    sections,
    isLoading: isSectionsLoading,
    sectionsCount,
  } = useGetSections(lessonId as string);

  // Get current section and its questions
  const currentSection = sections[currentSectionIndex];
  const questions =
    sections.flatMap((section) => section?.content?.questions || []) || [];

  console.log("sections", sections);
  const currentQuestion = questions[currentQuestionIndex] as QuestionType;
  const length = sections.length + questions.length;

  // Add current question to viewed questions when component renders
  useEffect(() => {
    if (currentQuestion && !viewedQuestions.includes(currentQuestion.id)) {
      setViewedQuestions((prev) => [...prev, currentQuestion.id]);
    }
  }, [currentQuestion]);

  // Navigate to next section
  const goToNextSection = () => {
    // playNavigationSound();
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
      setFeedbackMessage("");

      // Add first question of next section to viewed questions if not already viewed
      const nextSection = sections[currentSectionIndex + 1];
      if (nextSection?.content?.questions?.length > 0) {
        const firstQuestionId = nextSection.content.questions[0].id;
        if (!viewedQuestions.includes(firstQuestionId)) {
          setViewedQuestions((prev) => [...prev, firstQuestionId]);
        }
      }
    } else {
      // Navigate back to course page when all sections are completed
      navigate(`/learn`);
    }
  };

  // Navigate to previous section
  const goToPreviousSection = () => {
    // playNavigationSound();
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      return;
    }
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(0);
      setFeedbackMessage("");

      // Add first question of previous section to viewed questions if not already viewed
      const prevSection = sections[currentSectionIndex - 1];
      if (prevSection?.content?.questions?.length > 0) {
        const firstQuestionId = prevSection.content.questions[0].id;
        if (!viewedQuestions.includes(firstQuestionId)) {
          setViewedQuestions((prev) => [...prev, firstQuestionId]);
        }
      }
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    // playNavigationSound();
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setFeedbackMessage("");

      // Add next question to viewed questions if not already viewed
      if (questions[nextIndex]) {
        const nextQuestionId = questions[nextIndex].id;
        if (!viewedQuestions.includes(nextQuestionId)) {
          setViewedQuestions((prev) => [...prev, nextQuestionId]);
        }
      }
    }
  };

  // Handle loading states
  if (isLessonLoading || isSectionsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full border-4 animate-spin border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent"></div>
          <p className="mt-4 text-lg font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Handle case when no sections are available
  if (sections.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex gap-4 items-center mb-4">
            <Button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="px-4 py-2 text-blue-600 rounded-md border border-blue-600 hover:bg-blue-50"
            >
              Back to Course
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{lesson?.name}</h1>
          <p className="text-gray-600">{lesson?.description}</p>
          <div className="p-8 text-center text-gray-500">
            <Book className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p>No content available for this lesson yet.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log(currentQuestion);
  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Lesson Header */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <div className="flex gap-4 items-center mb-4">
          <Button
            onClick={() => navigate(`/learn`)}
            className="px-4 py-2 text-blue-600 rounded-md border border-blue-600 hover:bg-blue-50"
          >
            Back to Course
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{lesson?.name}</h1>
        <p className="text-gray-600">{lesson?.description}</p>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>

            <span className="text-sm font-medium text-gray-600">
              {Math.round(
                ((currentSectionIndex + 1 + currentQuestionIndex) / length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="overflow-hidden h-3 bg-gray-100 rounded-full shadow-inner">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: ` ${Math.round(
                  ((currentSectionIndex + 1 + currentQuestionIndex) / length) *
                    100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">{currentSection?.name}</h2>
        <p className="mb-6 text-gray-600">{currentSection?.description}</p>

        {/* Text Section */}
        {currentSection?.type === "text" && currentSection?.content && (
          <div
            className="max-w-none prose"
            dangerouslySetInnerHTML={{ __html: currentSection.content }}
          />
        )}

        {/* Exercise Section */}
        {currentSection?.type === "excercises" && questions.length > 0 && (
          <div className="mt-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-md">
              <h3 className="mb-4 text-xl font-medium">
                {currentQuestion?.question}
              </h3>
              {/* Multiple choice question */}
              {currentQuestion?.type === "choose" &&
                currentQuestion?.choices && (
                  <div className="space-y-3">
                    {currentQuestion.choices.map((choice, index) => {
                      return (
                        <Choice
                          choice={choice}
                          feedbackMessage={feedbackMessage}
                          index={index}
                          currentQuestion={currentQuestion}
                          setFeedbackMessage={setFeedbackMessage}
                          viewedQuestions={viewedQuestions}
                          setViewedQuestions={setViewedQuestions}
                        />
                      );
                    })}
                  </div>
                )}
              {/* Text input question */}
              {currentQuestion?.type === "text" && (
                <TextQuestion
                  textAnswer={textAnswer}
                  setTextAnswer={setTextAnswer}
                />
              )}

              {/* Feedback message */}
              {feedbackMessage && (
                <FeedbackMessageComponent
                sectionsLength={sections.length}
                currentSectionIndex={currentQuestionIndex}
                  message={feedbackMessage}
                  goToNextQuestion={goToNextQuestion}
                />
              )}

              <QuestionNavigation
                currentQuestionIndex={currentQuestionIndex}
                currentSection={currentSection}
                feedbackMessage={feedbackMessage}
                setFeedBackMessage={setFeedbackMessage}
                currentSectionIndex={currentSectionIndex}
                sectionsLength={sections.length}
                goToPreviousSection={goToPreviousSection}
                goToNextSection={goToNextSection}
                currentQuestion={currentQuestion}
                textAnswer={textAnswer}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons for text sections */}
        {currentSection?.type === "text" ? (
          <NavigateSectionsBtns
            currentSectionIndex={currentSectionIndex}
            sectionsLength={sections.length}
            goToPreviousSection={goToPreviousSection}
            goToNextSection={goToNextSection}
          />
        ) : null}
      </div>
    </div>
  );
};

export default LessonPage;
// ... existing code ...

// ... existing code ...

// ... existing code ...

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
  setFeedbackMessage: React.Dispatch<React.SetStateAction<string>>;
  feedbackMessage: string;
  viewedQuestions: number[];
  setViewedQuestions: React.Dispatch<React.SetStateAction<number[]>>;
};

const Choice = ({
  choice,
  index,
  currentQuestion,
  setFeedbackMessage,
  feedbackMessage,
  viewedQuestions,
  setViewedQuestions,
}: ChoiceProps) => {
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    // Check if this is a new answer (not previously answered)

    // Check if the answer is correct
    const a = currentQuestion?.choices?.[+currentQuestion?.answer - 1];
    const correct = answer === a;
    setIsAnswerCorrect(correct);

    // Set feedback message
    if (correct) {
      setFeedbackMessage("Correct! Well done.");
    } else {
      setFeedbackMessage("Incorrect");
    }

    // Add current question to viewed questions if not already viewed
    if (!viewedQuestions.includes(currentQuestion.id)) {
      setViewedQuestions((prev) => [...prev, currentQuestion.id]);
    }
  };

  return (
    <div
      key={index}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isAnswerCorrect !== null
          ? isAnswerCorrect
            ? "bg-green-50 border-green-500 shadow-md"
            : "bg-red-50 border-red-500 shadow-md"
          : ""
      }`}
      onClick={() => (!feedbackMessage ? handleAnswerSelect(choice) : null)}
    >
      {choice}
    </div>
  );
};

const FeedbackMessageComponent = ({
  message,
  goToNextQuestion,
  currentSectionIndex,
  sectionsLength,
}: {
  message: string;
  goToNextQuestion: () => void;
  currentSectionIndex: number;
  sectionsLength: number;
}) => {
  const isAnswerCorrect = message.includes("Correct");
  return (
    <div
      className={`flex justify-between items-center px-3 py-3 mt-6  rounded-md ${
        isAnswerCorrect ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <div
        className={`flex gap-2 items-center ${
          isAnswerCorrect ? "text-green-500" : "text-red-500"
        }`}
      >
        {isAnswerCorrect ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <XCircle className="w-6 h-6" />
        )}
        {message}
      </div>
      {currentSectionIndex < sectionsLength - 1 ? (
        <Button onClick={goToNextQuestion}>Next</Button>
      ) : null}
    </div>
  );
};

type QuestionNavigationProps = {
  currentQuestionIndex: number;
  currentSection: { content: { questions: QuestionType[] } };
  feedbackMessage: string;
  setFeedBackMessage: React.Dispatch<React.SetStateAction<string>>;
  currentSectionIndex: number;
  sectionsLength: number;
  goToPreviousSection: () => void;
  goToNextSection: () => void;
  currentQuestion: QuestionType;
  textAnswer: string;
};

const QuestionNavigation = ({
  currentQuestionIndex,
  currentSection,
  feedbackMessage,
  setFeedBackMessage,
  currentSectionIndex,
  sectionsLength,
  goToPreviousSection,
  goToNextSection,
  currentQuestion,
  textAnswer,
}: QuestionNavigationProps) => {
  return currentQuestionIndex ===
    currentSection.content.questions.length - 1 ? (
    <NavigateSectionsBtns
      currentSectionIndex={currentSectionIndex}
      sectionsLength={sectionsLength}
      goToPreviousSection={goToPreviousSection}
      goToNextSection={goToNextSection}
    />
  ) : (
    <div
      className={`flex justify-between items-center mt-6 ${
        feedbackMessage && "hidden"
      }`}
    >
      <Button
        onClick={goToPreviousSection}
        className="flex gap-2 items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-200"
        disabled={currentSectionIndex === 0}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </Button>

      <Button
        onClick={() => {
          if (currentQuestion.type === "text") {
            console.log("hey");
            if (textAnswer === currentQuestion.answer) {
              setFeedBackMessage("Correct! Will Done");
            } else {
              setFeedBackMessage("Incorrect!");
            }
          }
        }}
        className="flex gap-2 items-center px-4 py-2 text-white bg-green-500 rounded-lg shadow-sm transition-all duration-200 hover:bg-green-600"
        disabled={
          currentQuestion.type === "text"
            ? !textAnswer
            : textAnswer !== currentQuestion.answer
        }
      >
        Check Answer
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

type NavigateSectionsBtnsProps = {
  currentSectionIndex: number;
  sectionsLength: number;
  goToPreviousSection: () => void;
  goToNextSection: () => void;
};

const NavigateSectionsBtns = ({
  currentSectionIndex,
  sectionsLength,
  goToPreviousSection,
  goToNextSection,
}: NavigateSectionsBtnsProps) => {
  return (
    <div className="flex justify-between items-center mt-8">
      <Button
        onClick={goToPreviousSection}
        className="flex gap-2 items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        disabled={currentSectionIndex === 0}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </Button>

      <Button
        onClick={goToNextSection}
        className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        {currentSectionIndex < sectionsLength - 1
          ? "Next Section"
          : "Finish Lesson"}
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
