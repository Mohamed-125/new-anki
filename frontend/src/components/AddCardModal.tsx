import React, { useCallback, useEffect, useRef, useState } from "react";
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
import useAddOpenModal from "../hooks/useAddModalShortcuts";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";

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
  collectionId?: string;
  targetCollectionId?: string;
  setTargetCollectionId?: React.Dispatch<React.SetStateAction<string>>;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  collectionId,
  targetCollectionId,
  setTargetCollectionId,
  setIsMoveToCollectionOpen,
}: AddCardModalProps) {
  const isEdit = !!editId;
  useAddModalShortcuts(setIsAddCardModalOpen);

  useEffect(() => {
    if (defaultValues?.content) {
      setContent(defaultValues.content);
    }
  }, [defaultValues?.content]);

  const { updateCardHandler } = useCardActions();
  const { createCardHandler } = useCreateNewCard({
    collectionId,
    optimistic: {
      isOptimistic: optimistic?.isOptimistic,
      setOptimistic: optimistic?.setOptimistic
        ? optimistic?.setOptimistic
        : () => {},
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const cardData = {
      collectionId: defaultValues?.collectionId || targetCollectionId || null,
      videoId,
      content,
    };

    if (isEdit) {
      updateCardHandler(
        e,
        setIsAddCardModalOpen,
        content,
        editId,
        targetCollectionId
      );
    } else {
      createCardHandler(e, cardData, setIsAddCardModalOpen);
    }

    refetch();
    //@ts-ignore
    e.target.reset();
  };

  const backRef = useRef<HTMLInputElement>(null);

  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [examples, setExamples] = useState<string[]>([]);

  const translateHandler = async () => {
    if (defaultValues?.front) {
      setIsTranslationLoading(true);
      try {
        const { data } = await axios.post("/translate?examples=true", {
          text: defaultValues?.front,
        });

        const translations = data.translations as string[];

        // Step 2: Remove duplicates using Set
        const uniqueTranslations = [...new Set(translations)];

        // Step 3: Display or use unique translations

        setExamples(data.context.examples);
        setIsTranslationLoading(false);

        if (backRef.current)
          backRef.current.value = uniqueTranslations.splice(0, 4).join(",");
      } catch (err) {
        setIsTranslationLoading(false);
      }
    }
  };

  const onAnimationEnd = useCallback(() => {
    //@ts-ignore
    if (!isAddCardModalOpen) {
      setIsAddCardModalOpen(false);
      setContent("");
      setDefaultValues(null);
      setEditId?.("");
      setTargetCollectionId?.("");
    }
  }, []);

  useEffect(() => {
    if (!isAddCardModalOpen) {
      setIsTranslationLoading(false);
    }
  }, [isAddCardModalOpen]);

  return (
    <Modal
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsAddCardModalOpen}
      isOpen={isAddCardModalOpen}
    >
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
            <Button
              type="button"
              onClick={() => setIsMoveToCollectionOpen?.(true)}
            >
              Choose Collection
            </Button>
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
            <ReactQuillComponent
              className="my-editor"
              setContent={setContent}
              content={content}
            />
            <Button
              variant="primary"
              className="mt-3"
              type="button"
              onClick={() => {
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

export default React.memo(AddCardModal);
