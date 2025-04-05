import React from "react";
import { Trash } from "lucide-react";

interface Question {
  id: number;
  type: "choose" | "text";
  question: string;
  choices?: string[];
  answer: string | number;
}

interface QuestionListProps {
  questions: Question[];
  onDeleteQuestion: (id: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onDeleteQuestion,
}) => {
  return (
    <div>
      {questions.map((question, n) => (
        <div key={question.id} id={question.id.toString()} className="mb-6">
          {question.type === "choose" ? (
            <div className="px-3 py-5 bg-gray-100 rounded-md">
              <div className="flex justify-between items-center mb-5">
                <h3 className="mb-2 text-lg font-medium">
                  {n + 1} - Choose Question
                </h3>
                <button
                  onClick={() => onDeleteQuestion(question.id)}
                  type="button"
                  className="flex gap-1 items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Trash />
                </button>
              </div>
              <input
                type="text"
                placeholder="Question"
                required
                defaultValue={question.question}
                name={`${n + 1}-question-choose-${question.id}`}
                className="px-3 py-2 mb-4 w-full rounded-md border"
              />
              <div className="flex gap-4 items-center mb-4">
                <div className="flex-1">
                  {[1, 2].map((choiceNum) => (
                    <div
                      key={choiceNum}
                      className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300"
                    >
                      <input
                        type="radio"
                        defaultChecked={+question.answer === choiceNum}
                        required
                        value={choiceNum}
                        name={`${n + 1}-answer-${question.id}`}
                        className="w-5 h-5"
                      />
                      <input
                        type="text"
                        defaultValue={question.choices?.[choiceNum - 1]}
                        name={`${n + 1}-choice${choiceNum}-${question.id}`}
                        placeholder={`Choice ${choiceNum}`}
                        required
                        className="px-3 py-2 w-full bg-transparent rounded-md border border-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {[3, 4].map((choiceNum) => (
                    <div
                      key={choiceNum}
                      className="flex gap-1 items-center rounded-md py-3 px-2 has-[input:checked]:bg-green-300"
                    >
                      <input
                        type="radio"
                        defaultChecked={+question.answer === choiceNum}
                        required
                        value={choiceNum}
                        name={`${n + 1}-answer-${question.id}`}
                        className="w-5 h-5"
                      />
                      <input
                        type="text"
                        defaultValue={question.choices?.[choiceNum - 1]}
                        name={`${n + 1}-choice${choiceNum}-${question.id}`}
                        placeholder={`Choice ${choiceNum}`}
                        required
                        className="px-3 py-2 w-full bg-transparent rounded-md border border-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="mb-2 text-lg font-medium">
                  {n + 1} - Text Question
                </h3>
                <button
                  onClick={() => onDeleteQuestion(question.id)}
                  type="button"
                  className="flex gap-1 items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Trash />
                </button>
              </div>
              <input
                type="text"
                name={`${n + 1}-question-text-${question.id}`}
                defaultValue={question.question}
                placeholder="Question"
                required
                className="px-3 py-2 mb-4 w-full rounded-md border"
              />
              <textarea
                name={`${n + 1}-answer-${question.id}`}
                placeholder="Answer"
                required
                defaultValue={question.answer as string}
                className="px-3 py-2 w-full rounded-md border"
                rows={4}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
