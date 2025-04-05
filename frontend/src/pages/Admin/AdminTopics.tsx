import React, { useEffect, useState } from "react";
import useGetTopics from "@/hooks/useGetTopics";
import useTopicMutations from "@/hooks/Queries/useTopicMutations";
import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import Button from "@/components/Button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DragableComponent from "@/components/DraggableComponent";
import AddNewTopicModal from "@/components/AddNewTopicModal";

const AdminTopics = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string>();
  const [defaultValues, setDefaultValues] = useState<{
    title?: string;
    description?: string;
    language?: string;
    type: string;
  }>();
  const queryClient = useQueryClient();
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const {
    topics,
    isInitialLoading: topicsLoading,
    refetch,
  } = useGetTopics({ enabled: true });

  const { deleteTopic, reorderTopics } = useTopicMutations();

  const [arrangedTopics, setArrangedTopics] = useState(topics || []);

  useEffect(() => {
    if (topics) {
      setArrangedTopics(topics);
    }
  }, [topics]);

  const handleReorder = (newArrangedArr: any[]) => {
    reorderTopics.mutate(newArrangedArr);
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  if (topicsLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Topics</h2>

        <Button
          onClick={() => {
            setEditId(undefined);
            setDefaultValues(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          <span className="text-xl">+</span>
          Add new topic
        </Button>
      </div>

      <AddNewTopicModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        editId={editId}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
      />

      <div className="grid gap-8">
        {arrangedTopics?.map((topic, index) => (
          <DragableComponent
            key={topic._id}
            order={index + 1}
            setState={setArrangedTopics}
            state={arrangedTopics}
            reorderHandler={handleReorder}
          >
            <div className="p-6 text-white bg-blue-500 rounded-t-xl">
              <div className="flex justify-between items-center mb-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleExpand(topic._id)}
                >
                  <Link to={`${topic._id}`} className="flex gap-2 items-center">
                    {expandedTopics.includes(topic._id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <h2 className="text-2xl font-semibold">{topic.title}</h2>
                  </Link>
                  {topic.language && (
                    <p className="mt-1 text-sm text-gray-200">
                      Language: {topic.language.toUpperCase()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <ActionsDropdown
                    itemId={topic._id}
                    editHandler={() => {
                      setEditId(topic._id);
                      setDefaultValues({
                        title: topic.title,
                        language: topic.language,
                        type: topic.type,
                      });
                      setIsModalOpen(true);
                    }}
                    deleteHandler={() => {
                      deleteTopic.mutate(topic._id);
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedTopics.includes(topic._id)
                  ? "opacity-100"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              {/* <div className="p-4 bg-white rounded-b-lg border-b border-x">
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-medium">Videos</h3>
                  {topic.lessons && topic.lessons.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {topic.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className="p-3 bg-gray-50 rounded-md border"
                        >
                          <div className="overflow-hidden mb-2 rounded-md aspect-lesson">
                            <img
                              src={lesson.thumbnail}
                              alt={lesson.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <h4 className="mb-1 text-sm font-medium text-gray-900 line-clamp-1">
                            {lesson.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No videos in this topic</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium">Texts</h3>
                  {topic.texts && topic.texts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {topic.texts.map((text) => (
                        <div
                          key={text._id}
                          className="p-3 bg-gray-50 rounded-md border"
                        >
                          <h4 className="mb-1 text-sm font-medium text-gray-900 line-clamp-1">
                            {text.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {text.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No texts in this topic</p>
                  )}
                </div>
              </div> */}
            </div>
          </DragableComponent>
        ))}
      </div>

      {arrangedTopics?.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="mb-4 text-gray-600">No topics found</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
          >
            Create your first topic
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;
