import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import Form from "./Form";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import Button from "./Button";
import Modal from "./Modal";
import useModalStates from "@/hooks/useModalsStates";
import { TextType } from "@/pages/MyTexts";
import ReactQuillComponent from "./ReactQuillComponent";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const AddNewTextModal = () => {
  const queryClient = useQueryClient();
  const {
    defaultValues,
    setDefaultValues,
    isTextModalOpen,
    setIsTextModalOpen,
    editId,
  } = useModalStates();

  useAddModalShortcuts(setIsTextModalOpen, true);

  const invalidateTextQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["texts"] });
    queryClient.invalidateQueries({ queryKey: ["text"] });
  };
  const { mutateAsync } = useMutation({
    onSuccess() {
      invalidateTextQueries();
    },
    mutationFn: async (data: TextType) => {
      return await axios.post("text", data).then((res) => {
        return res.data;
      });
    },
  });

  const { data: text = {}, isLoading } = useQuery({
    queryKey: ["text", editId],
    queryFn: async () => {
      const response = await axios.get("text/" + editId);
      return response.data;
    },
    enabled: Boolean(editId),
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setTitle(text?.title);
    setContent(text?.content);
  }, [text]);

  const createTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("text_name") as string;

    if (name) {
      const data = {
        title,
        content,
        // defaultTextId,
      };
      mutateAsync(data).then(() => setIsTextModalOpen(false));
    }
  };

  const updateTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      title,
      content,
      //   defaultTextId,
    };

    axios
      .put(`text/${editId}`, data)
      .then((res) => {})
      .catch((err) => err)
      .finally(() => {
        setIsTextModalOpen(false);
        invalidateTextQueries();
        (e.target as HTMLFormElement).reset();
      });
  };
  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    formRef.current?.reset();
  };

  const navigate = useNavigate();

  return (
    <Modal
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsTextModalOpen}
      isOpen={isTextModalOpen}
      big={true}
      className="w-full "
    >
      {isLoading && <Loading />}
      <Modal.Header
        setIsOpen={setIsTextModalOpen}
        title={editId ? "Edit This Text" : "Add New Text"}
      />
      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) => (editId ? updateTextHandler(e) : createTextHandler(e))}
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Text Name</Form.Label>
            <Form.Input
              value={title}
              type="text"
              name="text_name"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Field>

          <Form.Field className={"grow"}>
            <Form.Label>Text Content</Form.Label>
            <ReactQuillComponent
              className={"text"}
              setContent={setContent}
              content={content}
            />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer className="flex justify-end gap-3">
          <Button
            size="parent"
            className={"py-3"}
            type="button"
            variant={"danger"}
            onClick={() => {
              setIsTextModalOpen(false);
              if (editId) {
                // navigate("/myTexts/" + editId, { replace: true });
              } else {
                // navigate("/myTexts", { replace: true });
              }
            }}
          >
            Cancel
          </Button>
          <Button size="parent" className={"py-3"}>
            {editId ? "Save Changes" : "Add Text"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddNewTextModal;
