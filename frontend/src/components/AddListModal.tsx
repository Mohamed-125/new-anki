import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useToasts from "@/hooks/useToasts";
import useModalsStates from "@/hooks/useModalsStates";
import { useState } from "react";
import { ListType } from "@/hooks/useGetTopicLists";

type AddListModalProps = {
  topicId: string;
  isListModalOpen: boolean;
  setIsListModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddListModal = ({
  topicId,
  isListModalOpen,
  setIsListModalOpen,
}: AddListModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { defaultValues } = useModalsStates();

  const { mutateAsync: createList } = useMutation<
    any,
    Error,
    Omit<ListType, "_id" | "createdAt" | "updatedAt" | "language" | "order">
  >({
    mutationFn: async (
      data: Omit<
        ListType,
        "_id" | "createdAt" | "updatedAt" | "language" | "order"
      >
    ) => {
      const response = await axios.post("/list", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-lists", topicId] });
      setIsListModalOpen(false);
      addToast("List created successfully!", "success");
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to create list",
        "error"
      );
    },
  });

  const { mutateAsync: updateList } = useMutation<
    any,
    Error,
    Omit<ListType, "_id" | "createdAt" | "updatedAt" | "language" | "order">
  >({
    mutationFn: async (data) => {
      const response = await axios.put(`/list/${defaultValues?.editId}`, data);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-lists", topicId] });
      setIsListModalOpen(false);
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to update list",
        "error"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const thumbnail = formData.get("thumbnail") as string;

    setIsLoading(true);
    let toast = addToast(
      defaultValues?.editId ? "Updating list..." : "Creating list...",
      "promise"
    );
    try {
      const data = {
        title,
        description,
        thumbnail,
        tags: tags.split(",").map((tag) => tag.trim()),
        topicId,
      };

      if (defaultValues?.editId) {
        await updateList(data);
        toast.setToastData({
          title: defaultValues?.editId
            ? "List updated successfully!"
            : "List created successfully!",
          type: "success",
        });
      } else {
        await createList(data);
        toast.setToastData({
          title: defaultValues?.editId
            ? "List updated successfully!"
            : "List created successfully!",
          type: "success",
        });
      }
    } catch (err) {
      toast.setToastData({
        title: defaultValues?.editId
          ? "Faild to update the list!"
          : "Faild to create the list!",
        type: "error",
      });
    }
    setIsLoading(false);
  };

  return (
    <Modal
      loading={isLoading}
      className="w-full max-w-2xl bg-white rounded-xl shadow-lg"
      setIsOpen={setIsListModalOpen}
      isOpen={isListModalOpen}
    >
      <Modal.Header
        setIsOpen={setIsListModalOpen}
        title={defaultValues?.editId ? "Edit List" : "Create New List"}
      />
      <Form onSubmit={handleSubmit} className="px-0 py-0">
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Title</Form.Label>
            <Form.Input
              name="title"
              defaultValue={defaultValues?.listTitle}
              placeholder="Enter list title"
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Thumbnail</Form.Label>
            <Form.Input
              name="thumbnail"
              defaultValue={defaultValues?.listThumbnail}
              placeholder="Enter list thumbnail"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Description</Form.Label>
            <Form.Textarea
              name="description"
              defaultValue={defaultValues?.listDescription}
              placeholder="Enter list description"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Input
              name="tags"
              defaultValue={defaultValues?.listTags}
              placeholder="Enter tags, separated by commas"
            />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsListModalOpen(false)}
              type="button"
              size="parent"
              variant="danger"
            >
              Cancel
            </Button>
            <Button type="submit" size="parent" disabled={isLoading}>
              {defaultValues?.listTitle ? "Update List" : "Create List"}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddListModal;
