import React, { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";
import useTopicMutations from "@/hooks/Queries/useTopicMutations";
import { useQueryClient } from "@tanstack/react-query";
import useToasts from "@/hooks/useToasts";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useGetCourses from "@/hooks/Queries/useGetCourses";

type AddNewTopicModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    language?: string;
    type: string;
  };
  setDefaultValues: React.Dispatch<
    React.SetStateAction<
      | {
          title?: string;
          description?: string;
          language?: string;
          type: string;
        }
      | undefined
    >
  >;
};

const AddNewTopicModal = ({
  isOpen,
  setIsOpen,
  editId,
  defaultValues,
  setDefaultValues,
}: AddNewTopicModalProps) => {
  const { createTopic, updateTopic } = useTopicMutations();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { selectedLearningLanguage } = useGetCurrentUser();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { courses, isLoading: isCoursesLoading } = useGetCourses();

  const [formData, setFormData] = useState({
    title: "",
    type: "lessons",
    language: selectedLearningLanguage || "",
  });

  console.log(formData);

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        title: defaultValues.title || "",
        type: defaultValues.type || "lessons",
        language: defaultValues.language || selectedLearningLanguage || "",
      });
    } else {
      setFormData({
        title: "",
        type: "lessons",
        language: selectedLearningLanguage || "",
      });
    }
  }, [defaultValues, selectedLearningLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toast = addToast(
      editId ? "Updating Topic..." : "Adding Topic...",
      "promise"
    );

    try {
      if (editId) {
        // Update existing topic
        await updateTopic.mutateAsync({
          id: editId,
          //@ts-ignore
          topicData: formData,
        });
        toast.setToastData({
          title: "Topic Updated!",
          type: "success",
        });
      } else {
        // Create new topic
        //@ts-ignore
        await createTopic.mutateAsync(formData);
        toast.setToastData({
          title: "Topic Created!",
          type: "success",
        });
      }

      // Reset form and close modal
      setFormData({
        title: "",
        type: "",
        language: selectedLearningLanguage || "",
      });
      setDefaultValues(undefined);
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving topic:", error);
      toast.setToastData({
        title: "Failed to Save Topic",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onAnimationEnd = () => {
    formRef.current?.reset();
    setDefaultValues(undefined);
  };

  return (
    <Modal
      loading={isLoading || createTopic.isPending || updateTopic.isPending}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      className="w-full max-w-lg"
    >
      <Modal.Header
        setIsOpen={setIsOpen}
        title={editId ? "Edit Topic" : "Add New Topic"}
      />
      <Form className="p-0" formRef={formRef} onSubmit={handleSubmit}>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Topic Title</Form.Label>
            <Form.Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter topic title"
              required
            />
          </Form.Field>

          <Form.Field>
            <Form.Label>Topic Type</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="px-4 py-2 mb-0 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="lessons">Lessons</option>
              <option value="lists">Lists</option>
            </Form.Select>
          </Form.Field>

          <Form.Field>
            <Form.Label>Language</Form.Label>
            <Form.Select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              className="px-4 py-2 mb-0 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a language</option>
              {courses?.map((course) => (
                <option key={course._id} value={course.lang}>
                  {course.lang}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
        </Form.FieldsContainer>

        <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => {
              setIsOpen(false);
              setDefaultValues(undefined);
            }}
            size="parent"
            type="button"
            variant="danger"
          >
            Cancel
          </Button>
          <Button
            size="parent"
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
          >
            {editId ? "Update Topic" : "Add Topic"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewTopicModal);
