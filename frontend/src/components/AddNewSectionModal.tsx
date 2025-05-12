import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef, useState } from "react";
import Form from "./Form";
import Button from "./Button";
import Modal from "./Modal";
import useToasts from "@/hooks/useToasts";

type AddNewSectionModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId?: string;
  lessonId: string;
  defaultValues?: {
    sectionName?: string;
    description?: string;
    type?: string;
  };
  setDefaultValues?: (values: any) => void;
};

type SectionType = {
  name: string;
  description: string;
  audio?: string;
  video?: string;
  type: "text" | "excercises" | "resources";
};

const AddNewSectionModal = ({
  isOpen,
  setIsOpen,
  editId,
  lessonId,
  defaultValues,
  setDefaultValues,
}: AddNewSectionModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const [sectionType, setSectionType] = useState("text");

  const { mutateAsync, isPending } = useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      setIsOpen(false);
    },
    mutationFn: async (data: Partial<SectionType>) => {
      return await axios
        .post(`/section?lessonId=${lessonId}`, data)
        .then((res) => res.data);
    },
  });

  const createSectionHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("section_name") as string;
    const description = formData.get("description") as string;

    const toast = addToast("Adding Section..", "promise");
    setIsLoading(true);

    if (name) {
      const data = { name, description, type: sectionType };

      console.log("create section function");
      mutateAsync(data)
        .then(() => {
          toast.setToastData({
            title: "Section Added!",
            isCompleted: true,
            type: "success",
          });
        })
        .catch(() => {
          toast.setToastData({
            title: "Failed To Add Section",
            isError: true,
            type: "error",
          });
        })
        .finally(() => setIsLoading(false));
    }
  };

  const updateSectionHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("section_name") as string;
    const description = formData.get("description") as string;

    const data = { name, description, type: sectionType };
    const toast = addToast("Updating Section..", "promise");

    try {
      await axios.patch(`section/${editId}`, data);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      toast.setToastData({ title: "Section Updated!", type: "success" });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({
        title: "Failed To Update Section",
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
      SectionName: null,
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
      className="w-full max-w-lg md:max-w-none"
    >
      <Modal.Header
        setIsOpen={setIsOpen}
        title={defaultValues?.sectionName ? "Edit Section" : "Add New Section"}
      />

      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) =>
          defaultValues?.sectionName
            ? updateSectionHandler(e)
            : createSectionHandler(e)
        }
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Section Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.sectionName}
              type="text"
              name="section_name"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter Section name"
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
              placeholder="Enter Section description"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Type</Form.Label>
            <Form.Select
              defaultValue={defaultValues?.type}
              type="text"
              onChange={(e) => setSectionType(e.target.value)}
              name="type"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={"text"} selected>
                Text
              </option>
              <option value={"excercises"}>Excercises</option>
              <option value={"resources"}>Resources</option>
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
            {defaultValues?.sectionName ? "Save Changes" : "Add Section"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewSectionModal);
