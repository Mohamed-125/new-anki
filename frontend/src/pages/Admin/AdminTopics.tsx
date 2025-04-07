import React, { useEffect, useState } from "react";
import useGetTopics from "@/hooks/useGetTopics";
import useTopicMutations from "@/hooks/Queries/useTopicMutations";
import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import Button from "@/components/Button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import DragableComponent from "@/components/DraggableComponent";
import AddNewTopicModal from "@/components/AddNewTopicModal";
import InfiniteScroll from "@/components/InfiniteScroll";
import { CourseType } from "@/hooks/Queries/useGetCourses";

const AdminTopics = ({ course }: { course: CourseType }) => {
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
  const { courseId } = useParams();

  const {
    topics,
    isInitialLoading: topicsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetTopics({
    enabled: Boolean(courseId),
    courseId: courseId || undefined,
  });

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
    <div className="mx-auto max-w-7xl">
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
        course={course}
        setIsOpen={setIsModalOpen}
        editId={editId}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
      />

      <InfiniteScroll
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        loadingElement={<p>loading</p>}
        className="grid gap-8"
      >
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
                  <Link
                    to={`/admin/topics/${topic._id}`}
                    className="flex gap-2 items-center"
                  >
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
            ></div>
          </DragableComponent>
        ))}
      </InfiniteScroll>

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
