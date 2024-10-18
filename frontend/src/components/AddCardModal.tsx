import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";
import Select, { SingleValue } from "react-select";
import useCardActions from "../hooks/useCardActions";
import "react-quill/dist/quill.snow.css";
import ReactQuillComponent from "./ReactQuillComponent";
import { OptionType } from "./AddVideoModal";
import useGetCollections from "../hooks/useGetCollections";
import FormButtons from "./FormButtons";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";

type AddCardModalProps = {
  isAddCardModalOpen: boolean;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setEditId?: React.Dispatch<React.SetStateAction<string>>;
  editId?: string;
  setDefaultValues: React.Dispatch<React.SetStateAction<any>>;
  optimistic?: {
    isOptimistic: boolean;
    setOptimistic: React.Dispatch<React.SetStateAction<any[]>>;
  };
  videoId?: string;
};

export function AddCardModal({
  isAddCardModalOpen,
  setIsAddCardModalOpen,
  defaultValues,
  content,
  setContent,
  setEditId,
  editId,
  setDefaultValues,
  optimistic,
}: AddCardModalProps) {
  const isEdit = !!editId;

  useEffect(() => {
    "isAddCardModalOpen", isAddCardModalOpen;
    if (!isAddCardModalOpen) {
      setDefaultValues?.(null);
      setEditId?.("");
      setContent("");
    }
  }, [isAddCardModalOpen]);

  useEffect(() => {
    if (defaultValues?.content) {
      setContent(defaultValues.content);
    }
  }, [defaultValues?.content]);

  useEffect(() => {
    "content", content;
  }, [content]);

  const { data: collections } = useGetCollections();

  const options = collections?.map((collection) => ({
    value: collection.id,
    label: collection.name,
  })) as OptionType[];

  options?.unshift({
    label: "No collection",
    value: "",
  });

  const [selectedCollection, setSelectedCollection] = useState(
    options?.[0].value ?? ""
  );

  const { updateCardHandler } = useCardActions();
  const { createCardHandler } = useCreateNewCard({
    optimistic: {
      isOptimistic: optimistic?.isOptimistic,
      setOptimistic: optimistic?.setOptimistic
        ? optimistic?.setOptimistic
        : () => {},
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const cardData = {
      collectionId: defaultValues.collectionId || selectedCollection || null,
      content,
    };

    if (isEdit) {
      updateCardHandler(
        e,
        setIsAddCardModalOpen,
        content,
        editId,
        selectedCollection
      );
    } else {
      createCardHandler(e, cardData, setIsAddCardModalOpen);
    }
  };

  return (
    <Modal setIsOpen={setIsAddCardModalOpen} isOpen={isAddCardModalOpen}>
      <Form className="w-[100%] max-w-[unset]" onSubmit={handleSubmit}>
        <Form.Title>{isEdit ? "Edit Card" : " Add New Card"} </Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Card Frontside</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.front}
              type="text"
              name="card_word"
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Card Collection</Form.Label>
            <Select
              onChange={(e: SingleValue<OptionType>) => {
                if (e) {
                  setSelectedCollection(e.value);
                }
              }}
              options={options}
              placeholder="Select a collection"
              defaultValue={
                options?.find(
                  (option) => option?.value === defaultValues?.collectionId
                ) || options?.[0]
              }
            />
          </Form.Field>

          <Form.Field>
            <Form.Label>Card backside</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.back}
              type="text"
              name="card_translation"
              required
            />
          </Form.Field>

          <Form.Field>
            <Form.Label>Content</Form.Label>
          </Form.Field>

          <ReactQuillComponent setContent={setContent} content={content} />
        </Form.FieldsContainer>
        <FormButtons isEdit={isEdit} setIsOpen={setIsAddCardModalOpen} />
      </Form>
    </Modal>
  );
}

export default AddCardModal;
