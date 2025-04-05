import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGetLesson from "../hooks/Queries/useGetLesson";
import useGetSections from "../hooks/Queries/useGetSections";
import { Book } from "lucide-react";
import Button from "@/components/Button";
import Question from "@/components/Question";
import LessonNavigation from "@/components/LessonNavigation";
import ResourceSection from "@/components/ResourceSection";

export type QuestionType = {
  id: number;
  type: "choose" | "text";
  question: string;
  choices?: string[];
  answer: string;
};

export type ResourceType = {
  type: "audio" | "video" | "image";
  url: string;
  title?: string;
  description?: string;
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
  // Using a Set to track unique viewed question IDs
  const [moves, setMoves] = useState(0);

  const [isAnswered, setIsAnswered] = useState(false);

  const [textAnswer, setTextAnswer] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>("");
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

  const currentQuestion = currentSection?.content?.questions?.[
    currentQuestionIndex
  ] as QuestionType;

  const questionSections = sections.filter(
    (section) => section.type === "excercises"
  );
  const length = sections.length + questions.length - questionSections.length;

  // Add current question to viewed questions when component renders

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

  const CheckAnswerHandler = () => {
    if (
      currentQuestion.question.toLowerCase() ===
      currentQuestion?.answer.toLowerCase()
    ) {
      setFeedbackMessage("Well Done, You are on fire!");
    } else {
      setFeedbackMessage("Incrorect!");
    }
    setIsAnswered(true);
  };

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
              {Math.round((moves / length) * 100)}%
            </span>
          </div>
          <div className="overflow-hidden h-3 bg-gray-100 rounded-full shadow-inner">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: ` ${Math.round((moves / length) * 100)}%`,
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
        {/* Resource Section */}
        {currentSection?.type === "resources" &&
          currentSection?.content?.resources && (
            <ResourceSection resources={currentSection.content.resources} />
          )}
        {/* Exercise Section */}
        {currentSection?.type === "excercises" && questions.length > 0 && (
          <div className="mt-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of{" "}
                {currentSection.content.questions.length}
              </span>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-md">
              <h3 className="mb-4 text-xl font-medium">
                {currentQuestion?.question}
              </h3>
              {/* Multiple choice question */}
              <Question
                currentQuestion={currentQuestion}
                // CheckAnswerHandler={CheckAnswerHandler}
                textAnswer={textAnswer}
                setTextAnswer={setTextAnswer}
                feedbackMessage={feedbackMessage}
                setFeedbackMessage={setFeedbackMessage}
                setIsAnswered={setIsAnswered}
              />

              {/* Feedback message */}
            </div>
          </div>
        )}
      </div>
      <LessonNavigation
        setCurrentSectionIndex={setCurrentSectionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        sections={sections}
        currentSection={currentSection}
        length={length}
        moves={moves}
        setMoves={setMoves}
        isAnswered={isAnswered}
        setIsAnswered={setIsAnswered}
        currentQuestion={currentQuestion}
        CheckAnswerHandler={CheckAnswerHandler}
        setFeedbackMessage={setFeedbackMessage}
        textAnswer={textAnswer}
        lessonId={lessonId as string}
        courseLevelId={courseLevelId as string}
        // questions={questions}
      />
    </div>
  );
};

export default LessonPage;
