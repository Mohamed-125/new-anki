import { Dialog, DialogContent } from "./ui/dialog";
import { LessonType } from "@/hooks/Queries/useLessonMutations";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextLesson: LessonType | undefined;
  courseLevelId?: string;
}

const CongratsModal = ({
  isOpen,
  onClose,
  nextLesson,
  courseLevelId,
}: CongratsModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 36l-8-8 4-4 4 4 12-12 4 4L20 36z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Congratulations!
          </h2>
          <p className="mb-6 text-gray-600">
            You've successfully completed this lesson.
          </p>

          {nextLesson && (
            <div className="p-4 mb-6 bg-gray-50 rounded-lg">
              <h3 className="mb-2 text-lg font-semibold">Up Next:</h3>
              <div className="flex gap-4 items-center">
                <img
                  src={nextLesson.img}
                  alt={nextLesson.name}
                  className="object-cover w-24 h-24 rounded-lg"
                />
                <div className="flex-1 text-left">
                  <h4 className="mb-1 text-lg font-medium">
                    {nextLesson.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {nextLesson.description}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  onClose();
                  navigate(
                    `/lesson/${nextLesson._id}${
                      courseLevelId ? `/${courseLevelId}` : ""
                    }`
                  );
                }}
                className="py-2 mt-4 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Start Next Lesson
              </Button>
            </div>
          )}

          <Button
            onClick={() => {
              onClose();
              navigate("/learn");
            }}
            variant="outline"
            className="py-2 w-full text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Back to Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CongratsModal;
