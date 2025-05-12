import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGetLesson from "../hooks/Queries/useGetLesson";
import useGetSections from "../hooks/Queries/useGetSections";
import { Book } from "lucide-react";
import Button from "@/components/Button";
import Question from "@/components/Question";
import LessonNavigation from "@/components/LessonNavigation";
import ResourceSection from "@/components/ResourceSection";
import "@/styles/highlight.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useUseEditor from "@/hooks/useUseEditor";
import TipTapEditor from "@/components/TipTapEditor";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

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
  const { lessonId, courseLevelId } = useParams<{
    lessonId: string;
    courseLevelId?: string;
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
  const { user } = useGetCurrentUser();

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

  const { editor, setContent } = useUseEditor(true);

  useEffect(() => {
    if (currentSection?.type === "text") {
      setContent(currentSection?.content?.text);
    }
  }, [currentSection]);

  // Process text content to highlight cards
  const highlightedContent = useMemo(() => {
    if (
      !currentSection?.content?.text ||
      !currentSection?.cards?.length ||
      currentSection.type !== "text"
    ) {
      return currentSection?.content?.text;
    }

    const parser = new DOMParser();
    //@ts-ignore
    const doc = parser.parseFromString(
      currentSection.content?.text,
      "text/html"
    );

    const traverseNodes = (node: any) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.textContent;
        let modifiedText = originalText;

        currentSection.cards.forEach((card) => {
          const regex = new RegExp(`\\b(${card.front.trim()})\\b`, "gi");
          modifiedText = modifiedText.replace(
            regex,
            `<span class="highlight" data-id=${card._id}>$1</span>`
          );
        });

        if (modifiedText !== originalText) {
          const wrapper = document.createElement("span");
          wrapper.innerHTML = modifiedText;
          node.replaceWith(...wrapper.childNodes);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(traverseNodes);
      }
    };

    Array.from(doc.body.childNodes).forEach(traverseNodes);
    return doc.body.innerHTML;
  }, [
    currentSection?.content?.text,
    currentSection?.cards,
    currentSection?.type,
  ]);

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
      <div className="container px-4 py-8 mx-auto sm:px-2">
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex gap-4 items-center mb-4">
            <Button
              onClick={() => navigate(-1)}
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
    <div className="container px-4 py-8 mx-auto sm:px-2">
      {/* Lesson Header */}
      <Button
        onClick={() => navigate(`/learn`)}
        variant="primary"
        className="px-4 py-2 mb-3 rounded-md border"
      >
        Back
      </Button>
      {user?.isAdmin && (
        <Button
          onClick={() =>
            navigate(
              `/admin/courses/courseId/${lesson?.courseLevelId}/${lesson?._id}`
            )
          }
          variant="primary"
          className="px-4 py-2 mb-3 rounded-md border"
        >
          Edit
        </Button>
      )}
      {/* <h1 className="text-3xl font-bold">{lesson?.name}</h1>
        <p className="text-gray-600">{lesson?.description}</p>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">

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
        </div> */}

      {/* Section Content */}
      <div className="p-6 mb-28 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">{currentSection?.name}</h2>
        <p className="mb-6 text-gray-600">{currentSection?.description}</p>
        {/* Text Section */}
        {currentSection?.type === "text" && currentSection?.content && (
          <TipTapEditor editor={editor} />
        )}
        {/* Resource Section */}
        {currentSection?.type === "resources" &&
          currentSection?.content?.resources && (
            <ResourceSection resources={currentSection.content.resources} />
          )}
        {/* Collections and Cards Section */}
        {currentSection?.collections &&
          currentSection.collections.length > 0 && (
            <div className="mt-4 mb-5">
              <h4>Learned Words</h4>
              {currentSection.collections.map((collection: any) => {
                return (
                  <div
                    key={collection._id}
                    className="overflow-hidden my-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {collection.name}
                      </h3>
                    </div>
                    {/* Cards Table */}
                    {currentSection?.cards &&
                      currentSection.cards.length > 0 && (
                        <div className="px-3 mt-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Front</TableHead>
                                <TableHead>Back</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentSection.cards
                                .filter(
                                  (card) => card.collectionId === collection._id
                                )
                                .map((card: any) => (
                                  <TableRow key={card._id}>
                                    <TableCell>{card.front}</TableCell>
                                    <TableCell>{card.back}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}

        {/* Notes Section */}
        {currentSection?.notes && currentSection.notes.length > 0 && (
          <div className="mt-10 space-y-4">
            <h4>Notes</h4>
            {currentSection.notes.map((note: any) => (
              <div
                key={note._id}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors duration-200 hover:border-blue-400"
              >
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-medium text-gray-900">
                      {note.title}
                    </h3>
                    <div className="max-w-none text-gray-600 prose">
                      {note.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        )}
      </div>
      <LessonNavigation
        lesson={lesson}
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
        courseLevelId={courseLevelId}
        // questions={questions}
      />
    </div>
  );
};

export default LessonPage;
