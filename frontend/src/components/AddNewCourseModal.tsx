import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef, useState } from "react";
import Form from "./Form";
import Button from "./Button";
import Modal from "./Modal";
import useToasts from "@/hooks/useToasts";

type CourseType = {
  name: string;
  language: string;
  _id: string;
  flag: string;
};

type AddNewCourseModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId?: string;
  defaultValues?: {
    courseName?: string;
    language?: string;
    flag?: string;
  };
  setDefaultValues?: (values: any) => void;
};

const AddNewCourseModal = ({
  isOpen,
  setIsOpen,
  editId,
  defaultValues,
  setDefaultValues,
}: AddNewCourseModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsOpen(false);
    },
    mutationFn: async (data: Partial<CourseType>) => {
      console.log(data);
      return await axios.post("course", data).then((res) => res.data);
    },
  });

  const createCourseHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("course_name") as string;
    const lang = formData.get("language") as string;
    const flag = formData.get("flag") as string;

    const toast = addToast("Adding Course...", "promise");
    setIsLoading(true);

    if (name && lang && flag) {
      const data = { name, lang, flag };

      mutateAsync(data)
        .then(() => {
          toast.setToastData({ title: "Course Added!", type: "success" });
        })
        .catch(() => {
          toast.setToastData({
            title: "Failed To Add Course",
            type: "error",
          });
        })
        .finally(() => setIsLoading(false));
    }
  };

  const updateCourseHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("course_name") as string;
    const lang = formData.get("language") as string;
    const flag = formData.get("flag") as string;

    const data = { name, lang, flag };
    const toast = addToast("Updating Course...", "promise");

    try {
      await axios.patch(`course/${editId}`, data);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.setToastData({ title: "Course Updated!", type: "success" });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({ title: "Failed To Update Course", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    formRef.current?.reset();
    setDefaultValues?.((pre: any) => ({
      ...pre,
      courseName: null,
      language: null,
      flag: null,
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
        title={defaultValues?.courseName ? "Edit Course" : "Add New Course"}
      />
      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) =>
          defaultValues?.courseName
            ? updateCourseHandler(e)
            : createCourseHandler(e)
        }
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Course Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.courseName}
              type="text"
              name="course_name"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter course name"
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Language Code</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.language}
              type="text"
              name="language"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter language code (e.g. en, de, fr)"
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Flag URL</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.flag}
              type="text"
              name="flag"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter flag image URL"
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
            {defaultValues?.courseName ? "Save Changes" : "Add Course"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewCourseModal);
