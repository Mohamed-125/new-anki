import React, { useEffect, useRef, useState } from "react";
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
import axios from "axios";

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
  refetch?: any;
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
  videoId,
  refetch,
}: AddCardModalProps) {
  const isEdit = !!editId;

  useEffect(() => {
    if (!isAddCardModalOpen) {
      setDefaultValues?.(null);
      setEditId?.("");
      setContent("");
    }
  }, [isAddCardModalOpen]);

  useEffect(() => {
    console.log(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    if (defaultValues?.content) {
      setContent(defaultValues.content);
    }
  }, [defaultValues?.content]);

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
      collectionId: defaultValues?.collectionId || selectedCollection || null,
      videoId,
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

    refetch();
    //@ts-ignore
    e.target.reset();
  };

  const [front, setFront] = useState("");
  const backRef = useRef<HTMLInputElement>(null);

  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [examples, setExamples] = useState<string[]>([]);

  const translateHandler = async () => {
    if (front) {
      setIsTranslationLoading(true);
      const { data } = await axios.post("/translate?examples=true", {
        text: front,
      });
      setIsTranslationLoading(false);

      console.log(data);
      const translations = data.translations as string[];

      // Step 2: Remove duplicates using Set
      const uniqueTranslations = [...new Set(translations)];

      // Step 3: Display or use unique translations
      console.log("Unique Translations:", data.context.examples);
      setExamples(data.context.examples);

      if (backRef.current)
        backRef.current.value = uniqueTranslations.splice(0, 4).join(",");
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
              onChange={(e) => setFront(e.target.value)}
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
              isInputLoading={isTranslationLoading}
              disabled={isTranslationLoading}
              ref={backRef}
              type="text"
              name="card_translation"
              required
            />
            <Button
              variant="primary"
              className="mt-3"
              type="button"
              onClick={translateHandler}
            >
              Auto Translate{" "}
            </Button>
          </Form.Field>
          <Form.Field>
            <Form.Label>Content</Form.Label>
            <ReactQuillComponent setContent={setContent} content={content} />
            <Button
              variant="primary"
              className="mt-3"
              type="button"
              onClick={() => {
                console.log(examples);
                const sources = examples.map(
                  (example: any) =>
                    ` <strong>

                  ${example.source.replace(
                    example.source_phrases[0].phrase,
                    `<strong style="color: rgb(230, 0, 0);">${example.source_phrases[0].phrase}</strong>`
                  )}
                    
                    </strong>
                     <br />
                     ${example.target} `
                );
                console.log("sources", sources);
                setContent((pre) => pre + sources.join("<br /> "));
              }}
            >
              Generate Examples
            </Button>
          </Form.Field>
        </Form.FieldsContainer>
        <FormButtons isEdit={isEdit} setIsOpen={setIsAddCardModalOpen} />
      </Form>
    </Modal>
  );
}

export default AddCardModal;
