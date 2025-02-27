import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";
import Select, { SingleValue } from "react-select";
import useCardActions from "../hooks/useCardActions";
import "react-quill/dist/quill.snow.css";
import TipTapEditor from "./TipTapEditor";
import { OptionType } from "./AddVideoModal";
import useGetCollections from "../hooks/useGetCollections";
import FormButtons from "./FormButtons";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";
import axios from "axios";
import useAddOpenModal from "../hooks/useAddModalShortcuts";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import useModalStates from "@/hooks/useModalsStates";
import useGetCollectionById from "@/hooks/useGetCollectionById";
import { IoClose } from "react-icons/io5";
import useUseEditor from "@/hooks/useUseEditor";
import { twMerge } from "tailwind-merge";

type AddCardModalProps = {
  collectionId?: string;
  optimistic?: {
    isOptimistic: boolean;
    setOptimistic: any;
  };
  videoId?: string;
};

export function AddCardModal({
  collectionId,
  optimistic,
  videoId,
}: AddCardModalProps) {
  const {
    isAddCardModalOpen,
    setIsAddCardModalOpen,
    isMoveToCollectionOpen,
    setIsMoveToCollectionOpen,
    editId,
    setEditId,
    defaultValues,
    setDefaultValues,
    targetCollectionId,
  } = useModalStates();

  const isEdit = !!editId;
  useAddModalShortcuts(setIsAddCardModalOpen);
  const { editor, setContent } = useUseEditor();

  useEffect(() => {
    // setDefaultValues((pre) => {
    //   return { ...pre, collectionId };
    // });
  }, [collectionId]);

  useEffect(() => {
    if (defaultValues?.content) {
      setContent(defaultValues.content);
    }
  }, [defaultValues?.content]);

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
    console.log(defaultValues?.collectionId || collectionId || null);
    const cardData = {
      collectionId: defaultValues?.collectionId || collectionId || null,
      videoId,
      content: editor?.getHTML(),
    };

    if (isEdit) {
      updateCardHandler(
        e,
        setIsAddCardModalOpen,
        editor?.getHTML(),
        editId,
        defaultValues?.collectionId || collectionId || null,
        frontValue,
        backValue
      );
    } else {
      createCardHandler(e, cardData, setIsAddCardModalOpen);
    }

    //@ts-ignore
    e.target.reset();
  };

  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [frontValue, setFrontValue] = useState("");
  const [backValue, setBackValue] = useState("");

  const translateHandler = async (examples?: boolean) => {
    console.log("hey");
    if (frontRef.current?.value) {
      setIsTranslationLoading(true);
      try {
        const { data } = await axios.post("/translate?examples=true", {
          text: frontRef.current?.value,
        });

        const translations = data.translations as string[];

        // Step 2: Remove duplicates using Set
        const uniqueTranslations = [...new Set(translations)];

        // Step 3: Display or use unique translations
        setIsTranslationLoading(false);

        if (backRef.current && examples)
          setBackValue(uniqueTranslations.splice(0, 4).join(","));

        return data.context.examples;
      } catch (err) {
        console.log(err);
        setIsTranslationLoading(false);
      }
    }
  };

  const onAnimationEnd = useCallback(() => {
    if (!isAddCardModalOpen || !isMoveToCollectionOpen) {
      setIsAddCardModalOpen(false);
      setContent("");
      setDefaultValues(null);
      setEditId?.("");
      setFrontValue("");
      setBackValue("");
      if (backRef.current && frontRef.current) {
        backRef.current.value = "";
        frontRef.current.value = "";
      }
    }
  }, [isAddCardModalOpen, isMoveToCollectionOpen]);

  useEffect(() => {
    if (!isAddCardModalOpen) {
      setIsTranslationLoading(false);
    }
  }, [isAddCardModalOpen]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const { collection } = useGetCollectionById(
    defaultValues?.collectionId || collectionId
  );

  return (
    <Modal
      className={`w-full max-w-2xl bg-white rounded-xl shadow-lg ${
        isMoveToCollectionOpen ? "opacity-0 pointer-events-none" : ""
      }`}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsAddCardModalOpen}
      isOpen={isAddCardModalOpen}
    >
      <Modal.Header
        setIsOpen={setIsAddCardModalOpen}
        title={isEdit ? "Edit Card" : "Add New Card"}
      />
      <Form formRef={formRef} className="px-0 py-0" onSubmit={handleSubmit}>
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Card Front Side</Form.Label>
            <Form.Textarea
              value={defaultValues?.front || frontValue}
              onChange={(e) => {
                setFrontValue(e.target.value);
                setDefaultValues((pre: {}) => {
                  return { ...pre, front: null };
                });
              }}
              type="text"
              name="card_word"
              ref={frontRef}
              required
              className="w-full px-4 py-2 text-gray-900 transition-all border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the front side content"
            />
          </Form.Field>
          <Form.Field>
            <Button
              type="button"
              onClick={() => setIsMoveToCollectionOpen?.(true)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              Choose Collection
            </Button>
          </Form.Field>

          <Form.Field>
            <Form.Label>
              {collection?.name && (
                <span className="flex items-center gap-2">
                  Card Collection
                  {"" + " : " + collection?.name}
                  <Button
                    onClick={() => {
                      setDefaultValues((pre) => {
                        return { ...pre, collectionId: null };
                      });
                    }}
                    variant="danger"
                    className="grid w-6 h-6 transition-colors !p-0 duration-200 rounded-full place-items-center hover:bg-red-400"
                  >
                    <IoClose className="text-[18px] font-medium" />
                  </Button>{" "}
                </span>
              )}
            </Form.Label>
            <Button
              type="button"
              onClick={() => {
                setIsMoveToCollectionOpen(true);
              }}
            >
              Choose Collection
            </Button>
          </Form.Field>

          <Form.Field>
            <Form.Label>Card Back Side</Form.Label>
            <Form.Textarea
              defaultValue={defaultValues?.back}
              isLoading={isTranslationLoading}
              disabled={isTranslationLoading}
              type="text"
              ref={backRef}
              value={defaultValues?.back || backValue}
              onChange={(e) => {
                setBackValue(e.target.value);
                setDefaultValues((pre: {}) => {
                  return { ...pre, back: null };
                });
              }}
              name="card_translation"
              required
              className="w-full px-4 py-2 text-gray-900 transition-all border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the back side content"
            />
            <Button
              variant="primary"
              className="w-full px-4 py-2 mt-3 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
              type="button"
              disabled={
                frontValue ? false : defaultValues?.front ? false : true
              }
              //@ts-ignore
              onClick={translateHandler}
            >
              Auto Translate
            </Button>
          </Form.Field>
          <Form.Field>
            <Form.Label>Content</Form.Label>
            <div
              className={twMerge(
                "p-4 relative border border-gray-200 rounded-lg",
                isTranslationLoading && "inputLoading"
              )}
            >
              <TipTapEditor editor={editor} />
              {isTranslationLoading && <i className="loader loader-input"></i>}
            </div>
            <Button
              variant="primary"
              className="w-full px-4 py-2 mt-3 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
              type="button"
              disabled={
                frontValue ? false : defaultValues?.front ? false : true
              }
              onClick={async () => {
                const examples = await translateHandler(true);

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

                console.log(sources.join("<br /> "));
                setContent((pre) => pre + sources.join("<br /> "));
              }}
            >
              Generate Examples
            </Button>
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer>
          <FormButtons isEdit={isEdit} setIsOpen={setIsAddCardModalOpen} />
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default React.memo(AddCardModal);
