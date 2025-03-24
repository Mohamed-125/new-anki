import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef, useState } from "react";
import Form from "./Form";
import Button from "./Button";
import Modal from "./Modal";
import useToasts from "@/hooks/useToasts";

type LessonType = {
  name: string;
  description?: string;
  type: "lesson" | "revision" | "exam";
  _id: string;
};

type AddNewLessonModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId?: string;
  courseLevelId: string;
  defaultValues?: {
    lessonName?: string;
    description?: string;
    type?: "lesson" | "revision" | "exam";
  };
  setDefaultValues?: (values: any) => void;
};

const AddNewLessonModal = ({
  isOpen,
  setIsOpen,
  editId,
  courseLevelId,
  defaultValues,
  setDefaultValues,
}: AddNewLessonModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseLevelId] });
      setIsOpen(false);
    },
    mutationFn: async (data: Partial<LessonType>) => {
      return await axios
        .post(`/lesson?courseLevelId=${courseLevelId}`, data)
        .then((res) => res.data);
    },
  });

  const createLessonHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("lesson_name") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as "lesson" | "revision" | "exam";

    const toast = addToast("Adding Lesson...", "promise");
    setIsLoading(true);

    if (name && type) {
      const data = { name, description, type };

      mutateAsync(data)
        .then(() => {
          toast.setToastData({ title: "Lesson Added!", isCompleted: true });
        })
        .catch(() => {
          toast.setToastData({
            title: "Failed To Add Lesson",
            isError: true,
          });
        })
        .finally(() => setIsLoading(false));
    }
  };

  const updateLessonHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("lesson_name") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as "lesson" | "revision" | "exam";

    const data = { name, description, type };
    const toast = addToast("Updating Lesson...", "promise");

    try {
      await axios.patch(`lesson/${editId}`, data);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["lessons", courseLevelId] });
      toast.setToastData({ title: "Lesson Updated!", isCompleted: true });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({ title: "Failed To Update Lesson", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    formRef.current?.reset();
    setDefaultValues?.((pre: any) => ({
      ...pre,
      lessonName: null,
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
        title={defaultValues?.lessonName ? "Edit Lesson" : "Add New Lesson"}
      />
      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) =>
          defaultValues?.lessonName
            ? updateLessonHandler(e)
            : createLessonHandler(e)
        }
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Lesson Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.lessonName}
              type="text"
              name="lesson_name"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter lesson name"
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
              placeholder="Enter lesson description"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Type</Form.Label>
            <Form.Select
              defaultValue={defaultValues?.type}
              name="type"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="lesson">Lesson</option>
              <option value="revision">Revision</option>
              <option value="exam">Exam</option>
            </Form.Select>
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
            {defaultValues?.lessonName ? "Save Changes" : "Add Lesson"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewLessonModal);
