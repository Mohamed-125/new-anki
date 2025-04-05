import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef, useState } from "react";
import Form from "./Form";
import Button from "./Button";
import Modal from "./Modal";
import useToasts from "@/hooks/useToasts";
import { CoursecourseLevelType } from "@/pages/Admin/AdminCourses";

type AddNewcourseLevelModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId?: string;
  lessonId?: string;
  courseId: string;
  defaultValues?: {
    courseLevelName?: string;
    description?: string;
    type?: string;
  };
  setDefaultValues?: (values: any) => void;
};

const AddNewcourseLevelModal = ({
  isOpen,
  setIsOpen,
  editId,
  lessonId,
  defaultValues,
  setDefaultValues,
  courseId,
}: AddNewcourseLevelModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["courseLevel", courseId] });
      setIsOpen(false);
    },
    mutationFn: async (data: Partial<CoursecourseLevelType>) => {
      return await axios
        .post(`/courseLevel?courseId=${courseId}`, data)
        .then((res) => res.data);
    },
  });

  const createcourseLevelHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("courseLevel_name") as string;
    const description = formData.get("description") as string;

    const toast = addToast("Adding courseLevel..", "promise");
    setIsLoading(true);

    if (name && description) {
      const data = { name, description };

      mutateAsync(data)
        .then(() => {
          toast.setToastData({
            title: "courseLevel Added!",
            isCompleted: true,
          });
        })
        .catch(() => {
          toast.setToastData({
            title: "Failed To Add courseLevel",
            type: "error",
          });
        })
        .finally(() => setIsLoading(false));
    }
  };

  const updatecourseLevelHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("courseLevel_name") as string;
    const description = formData.get("description") as string;

    const data = { name, description };
    const toast = addToast("Updating courseLevel..", "promise");

    try {
      await axios.patch(`courseLevel/${editId}`, data);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["courseLevel", lessonId] });
      toast.setToastData({ title: "courseLevel Updated!", type: "success" });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({
        title: "Failed To Update courseLevel",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    formRef.current?.reset();
    setDefaultValues?.((pre: any) => ({
      ...pre,
      courseLevelName: null,
      description: null,
      type: null,
    }));
  };

  return (
    <Modal
      loading={isPending || isLoading}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      className="w-full max-w-lg"
    >
      <Modal.Header
        setIsOpen={setIsOpen}
        title={
          defaultValues?.courseLevelName
            ? "Edit courseLevel"
            : "Add New courseLevel"
        }
      />
      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) =>
          defaultValues?.courseLevelName
            ? updatecourseLevelHandler(e)
            : createcourseLevelHandler(e)
        }
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>courseLevel Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.courseLevelName}
              type="text"
              name="courseLevel_name"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter courseLevel name"
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Description</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.description}
              type="text"
              name="description"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter courseLevel description"
              required
            />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => setIsOpen(false)}
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
            {defaultValues?.courseLevelName
              ? "Save Changes"
              : "Add courseLevel"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewcourseLevelModal);
