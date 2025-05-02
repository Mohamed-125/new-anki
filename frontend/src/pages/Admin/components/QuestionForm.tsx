import React, { useState } from "react";
import { PlusIcon } from "lucide-react";

interface QuestionFormProps {
  showQuestionDropdown: boolean;
  setShowQuestionDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  onAddQuestion: (type: "choose" | "text") => void;
  onPasteQuestions: (content: string) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  showQuestionDropdown,
  setShowQuestionDropdown,
  onAddQuestion,
  onPasteQuestions,
}) => {
  const [addContentTab, setAddContentTab] = useState(false);
  const [pasteContent, setPasteContent] = useState("");

  return (
    <div className="relative">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            !addContentTab
              ? "text-white bg-blue-600"
              : "text-gray-700 bg-gray-100"
          }`}
          onClick={() => setAddContentTab(false)}
        >
          Add Questions
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            addContentTab
              ? "text-white bg-blue-600"
              : "text-gray-700 bg-gray-100"
          }`}
          onClick={() => setAddContentTab(true)}
        >
          Paste Questions
        </button>
      </div>

      {addContentTab ? (
        <div className="mb-6">
          <textarea
            className="p-4 w-full h-48 font-mono text-sm rounded-md border"
            placeholder="Paste your questions array here..."
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              onPasteQuestions(pasteContent);
              setPasteContent("");
            }}
            className="px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Add Questions
          </button>
        </div>
      ) : (
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setShowQuestionDropdown(!showQuestionDropdown)}
            type="button"
            className="grid place-items-center mx-auto w-10 h-10 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50"
          >
            <PlusIcon />
          </button>
          {showQuestionDropdown && (
            <div className="absolute left-3 bottom-12 z-10 mt-2 w-36 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg">
              <div className="py-1" role="menu">
                <button
                  className="block px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    onAddQuestion("choose");
                    setShowQuestionDropdown(false);
                  }}
                >
                  Choose Question
                </button>
                <button
                  className="block px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    onAddQuestion("text");
                    setShowQuestionDropdown(false);
                  }}
                >
                  Text Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
