import { useNavigate } from "react-router-dom";
import useGetLessons from "../hooks/Queries/useGetLessons";
import { Book } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";

const GrammarLessons = () => {
  const navigate = useNavigate();

  // Fetch grammar lessons
  const { lessons, isLoading } = useGetLessons({
    lessonType: "grammar",
  });

  if (isLoading) {
    return (
      <div className="container">
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <Skeleton className="mb-4 w-48 h-8" />
          <Skeleton className="w-full h-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Grammar Header */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md sm:py-3">
        <div className="flex gap-4 items-center mb-4">
          <Book className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold sm:text-xl">Grammar Lessons</h1>
            <p className="text-gray-600 sm:text-md">
              Master the fundamentals of grammar through structured lessons
            </p>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-3 gap-4 md:grid-cols-2 sm:grid-cols-1">
        {lessons?.map((lesson) => {
          return (
            <div
              key={lesson._id}
              onClick={() => navigate(`/learn/${lesson._id}`)}
              className={`p-6 sm:py-3 cursor-pointer bg-white rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-[1.02] ${
                lesson?.isCompleted && "!bg-green-400"
              }`}
            >
              <h3 className="mb-2 text-xl font-semibold">{lesson.name}</h3>
              <p className="text-gray-600">{lesson.description}</p>
              <div className="flex gap-2 items-center mt-4">
                <div className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full">
                  Grammar
                </div>
                {lesson?.difficulty && (
                  <div className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
                    {lesson?.difficulty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrammarLessons;
