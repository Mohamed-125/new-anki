import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";
import useCardActions from "../hooks/useCardActions";
import "react-quill/dist/quill.snow.css";
import TipTapEditor from "./TipTapEditor";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";
import useCreateMultipleCards from "../hooks/useCreateMultipleCards";
import axios from "axios";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import useModalStates from "@/hooks/useModalsStates";
import useUseEditor from "@/hooks/useUseEditor";
import { twMerge } from "tailwind-merge";
import useToasts from "@/hooks/useToasts";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { TextToSpeech } from "./TextToSpeech";
import { fetchConjugations } from "@/utils/conjugations";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { languageCodeMap } from "../../../languages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "./Loading";
import { Skeleton } from "./ui/skeleton";
import MoveCollectionModal from "./MoveCollectionModal";
import { IoClose } from "react-icons/io5";
import useGetCollectionById from "@/hooks/useGetCollectionById";
import useGetCollections from "@/hooks/useGetCollections";

type CardData = {
  front: string;
  back: string;
  content?: string;
  collectionId?: string;
  videoId?: string;
  sectionId?: string | null;
};

type AddCardModalProps = {
  collectionId?: string;
  optimistic?: {
    isOptimistic: boolean;
    setOptimistic: any;
  };
  videoId?: string;
  onCardCreated?: (cardId: string) => Promise<void>;
};

export function AddCardModal({
  collectionId,
  optimistic,
  videoId,
  onCardCreated,
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

  const [mode, setMode] = useState<"single" | "multi">("single");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [conjugations, setConjugations] = useState<
    { tense: string; conjugations: { person: string; form: string }[] }[]
  >([]);
  const [isLoadingConjugations, setIsLoadingConjugations] = useState(false);
  const { user, selectedLearningLanguage } = useGetCurrentUser();
  const [cards, setCards] = useState<CardData[]>([]);
  const [examples, setExamples] = useState<any[]>([]);
  const [isExamplesVisible, setIsExmaplesVisible] = useState(false);

  const sampleCardJson = {
    cards: [
      {
        front: "the word",
        back: "Translation,meaning,definition in the word language - the translation of the word in the user language in this case arabic",
        content:
          "<p>Optional content with examples or context and should have more than one example if possible with it's tranlation and the word should be bolded in the original and translated language</p>",
      },
    ],
  };
  const handleJsonPaste = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed.cards)) {
        throw new Error('JSON must contain a "cards" array');
      }
      setCards(parsed.cards);
      setJsonError("");
    } catch (err: any) {
      setJsonError(err.message);
      setCards([]);
    }
  };

  const { createMultipleCardsHandler } = useCreateMultipleCards({
    collectionId: defaultValues?.collectionId || collectionId || null,
  });

  const handleMultiCardSubmit = async () => {
    if (cards.length === 0) return;

    setIsLoading(true);

    try {
      // Prepare cards with additional data
      const cardsWithMetadata = cards.map((card) => ({
        ...card,
        collectionId: defaultValues?.collectionId || collectionId || null,
        videoId,
        sectionId: defaultValues?.sectionId || null,
      }));

      await createMultipleCardsHandler(cardsWithMetadata);
      setIsAddCardModalOpen(false);
    } catch (err) {
      console.error("Error creating multiple cards:", err);
    }

    setIsLoading(false);
  };

  const isEdit = !!editId;
  useAddModalShortcuts(setIsAddCardModalOpen);
  const { editor, setContent } = useUseEditor();

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

  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cardData = {
      collectionId: defaultValues?.collectionId || collectionId || null,
      videoId,
      content: editor?.getHTML(),
      sectionId: defaultValues?.sectionId || null,
    };

    setIsLoading(true);
    if (isEdit) {
      await updateCardHandler(
        e,
        setIsAddCardModalOpen,
        editor?.getHTML(),
        editId,
        defaultValues?.collectionId || collectionId || null,
        frontValue.trim(),
        backValue.trim()
      );
    } else {
      const createdCard = await createCardHandler(e, cardData);
      onCardCreated?.(createdCard._id);
    }

    setIsAddCardModalOpen(false);
    setIsLoading(false);
    //@ts-ignore
    e.target.reset();
  };

  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [frontValue, setFrontValue] = useState("");
  const [backValue, setBackValue] = useState("");

  useEffect(() => {
    if (isExamplesVisible) {
      const sources = examples.map(
        (example: any) =>
          ` <strong>
      ${example.source.replace(
        frontValue || defaultValues?.front,
        `<span style="color: rgb(230, 0, 0);">${
          frontValue || defaultValues?.front
        }</span>`
      )}
    </strong>
    <br />
    ${example.target} `
      );

      setContent((pre) => pre + sources.join("<br /> "));
    }
  }, [isExamplesVisible]);

  const translateHandler = async (showExamples?: boolean) => {
    if (frontRef.current?.value) {
      setIsTranslationLoading(true);
      try {
        const { data } = await axios.post(
          `/translate/translate-examples?examples=${true}&language=${[
            selectedLearningLanguage,
          ]}&targetLanguage=${user?.translationLanguage || "en"}`,
          {
            text: frontRef.current?.value.trim(),
          }
        );

        const translations = data.translations as string;

        setIsTranslationLoading(false);

        if (showExamples) {
          setExamples(data.examples);
          setIsExmaplesVisible(true);
        } else {
          console.log(translations);
          setBackValue(translations);
          setExamples(data.examples);
        }
        // Only set back value for translation
      } catch (err) {
        console.log(err);
        setIsTranslationLoading(false);
      }
    }
  };

  // Clear form when modal is opened
  useEffect(() => {
    // Reset all form fields and state when the modal opens
    if (!isAddCardModalOpen) {
      setTimeout(() => {
        setContent("");
        setConjugations([]);
        setDefaultValues(null);
        setEditId?.("");
        setFrontValue("");
        setBackValue("");
        setIsTranslationLoading(false);
        setExamples([]);
        setIsExmaplesVisible(false);
        setJsonInput("");
        setMode("single");
        if (editor) {
          editor.commands.clearContent();
        }

        // Reset form fields directly
        if (frontRef.current) frontRef.current.value = "";
        if (backRef.current) backRef.current.value = "";
      }, 200);
    }
  }, [isAddCardModalOpen, editor]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const { collection, isLoading: isCollectionLoading } = useGetCollectionById(
    defaultValues?.collectionId || collectionId
  );

  const { collections } = useGetCollections({
    enabled: isMoveToCollectionOpen,
    sectionId: defaultValues?.sectionId || null,
  });

  return (
    <Modal
      loading={isLoading || isCollectionLoading}
      className={`w-full max-w-2xl bg-white rounded-xl shadow-lg ${
        isMoveToCollectionOpen ? "opacity-0 pointer-events-none" : ""}`}
      setIsOpen={setIsAddCardModalOpen}
      isOpen={isAddCardModalOpen}
    >
      {/* <MoveCollectionModal /> */}
      <Modal.Header
        setIsOpen={setIsAddCardModalOpen}
        title={isEdit ? "Edit Card" : "Add New Card"}
      />
      <Tabs
        defaultValue="single"
        className="w-full"
        value={mode}
        onValueChange={(value) => setMode(value as "single" | "multi")}
      >
        {!defaultValues?.front && !frontValue && (
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="single">Single Card</TabsTrigger>
            <TabsTrigger value="multi">Multiple Cards</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="single">
          <Form formRef={formRef} className="px-0 py-0" onSubmit={handleSubmit}>
            <Form.FieldsContainer className="space-y-4">
              <Form.Field>
                <Form.Label>Card Front Side</Form.Label>
                <div className="space-y-2">
                  <Form.Textarea
                    value={defaultValues?.front || frontValue || ""}
                    onChange={(e) => {
                      setFrontValue(e.target.value);
                      setDefaultValues((pre: {}) => {
                        return { ...pre, front: null };
                      });
                      setConjugations([]);
                    }}
                    type="text"
                    name="card_word"
                    ref={frontRef}
                    required
                    className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter the front side content"
                  />
                  <div className="flex gap-2 items-center">
                    {defaultValues?.front || frontValue ? (
                      <>
                        <TextToSpeech
                          text={defaultValues?.front || frontValue}
                        />

                        <Button
                          type="button"
                          variant="secondary"
                          className="text-sm"
                          disabled={!frontValue && !defaultValues?.front}
                          onClick={async () => {
                            const sourceLang =
                              languageCodeMap[
                                selectedLearningLanguage.toLowerCase()
                              ] || "english";
                            const result = await fetchConjugations(
                              frontValue || defaultValues?.front,
                              sourceLang,
                              (message) => addToast(message, "error"),
                              setIsLoadingConjugations
                            );
                            setConjugations(result);
                          }}
                        >
                          Conjugate Verb
                        </Button>
                      </>
                    ) : null}
                  </div>
                  {isLoadingConjugations && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {" "}
                                <Skeleton className="w-11 h-4 rounded-sm" />
                              </TableHead>
                              {[1, 2, 3, 4, 5, 6].map((conj, idx) => (
                                <TableHead>
                                  <Skeleton className="w-11 h-4 rounded-sm" />
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {conjugations.map((_, personIdx) => {
                              if (personIdx >= 6) {
                                return;
                              }
                              return (
                                <TableRow key={personIdx}>
                                  <TableCell className="font-medium">
                                    <Skeleton className="w-11 h-4 rounded-sm" />
                                  </TableCell>
                                  {conjugations.map((conj, tenseIdx) => {
                                    return (
                                      <TableCell key={tenseIdx}>
                                        <Skeleton className="w-11 h-4 rounded-sm" />
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                  {conjugations.length > 0 && (
                    <Card className="mt-4">
                      <CardContent className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="whitespace-nowrap bg-gray-100">
                                Personal pronouns{" "}
                              </TableHead>
                              {conjugations.map((conj, idx) => (
                                <TableHead
                                  className="w-max whitespace-nowrap bg-gray-100 border-l"
                                  key={idx}
                                >
                                  {conj.tense}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {conjugations.map((_, personIdx) => {
                              if (personIdx >= 6) {
                                return;
                              }
                              return (
                                <TableRow key={personIdx}>
                                  <TableCell className="font-medium bg-gray-100">
                                    {
                                      conjugations[personIdx].conjugations[
                                        personIdx
                                      ]?.person
                                    }
                                  </TableCell>
                                  {conjugations.map((conj, tenseIdx) => {
                                    return (
                                      <TableCell
                                        className="w-max border-l"
                                        key={tenseIdx}
                                      >
                                        {conj.conjugations[personIdx]?.form}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Form.Field>

              <Form.Field>
                <Form.Label>
                  {collection?.name && (
                    <span className="flex gap-2 items-center">
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
                  onClick={() => setIsMoveToCollectionOpen?.(true)}
                  className="px-4 py-2 w-full text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                >
                  Choose Collection
                </Button>
              </Form.Field>

              <Form.Field>
                <Form.Label>Card Back Side</Form.Label>
                <Form.Textarea
                  isLoading={isTranslationLoading}
                  disabled={isTranslationLoading}
                  type="text"
                  ref={backRef}
                  value={backValue || defaultValues?.back || ""}
                  onChange={(e) => {
                    setBackValue(e.target.value);
                    setDefaultValues((pre: {}) => {
                      return { ...pre, back: null };
                    });
                  }}
                  name="card_translation"
                  required
                  className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter the back side content"
                />
                <Button
                  variant="primary"
                  className="px-4 py-2 mt-3 w-full text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                  type="button"
                  disabled={
                    frontValue ? false : defaultValues?.front ? false : true
                  }
                  //@ts-ignore
                  onClick={() => {
                    translateHandler(false);
                  }}
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
                  {isTranslationLoading && (
                    <i className="loader loader-input"></i>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="px-4 py-2 mt-3 w-full text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                  type="button"
                  disabled={
                    frontValue ? false : defaultValues?.front ? false : true
                  }
                  onClick={async () => {
                    await translateHandler(true);
                  }}
                >
                  Generate Examples
                </Button>
              </Form.Field>
            </Form.FieldsContainer>
            <Modal.Footer>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddCardModalOpen(false)}
                  type="button"
                  size="parent"
                  variant={"danger"}
                >
                  Cancel
                </Button>
                <Button size="parent">
                  {isEdit ? "Save Changes" : "Add Card"}
                </Button>
              </div>
            </Modal.Footer>
          </Form>
        </TabsContent>
        <TabsContent value="multi">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Paste JSON</h3>
              <Textarea
                placeholder="Paste your cards JSON here..."
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  handleJsonPaste(e.target.value);
                }}
                className="min-h-[200px]"
              />
              {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
            </div>

            <Form.Field>
              <Form.Label>
                {collection?.name && (
                  <span className="flex gap-2 items-center">
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
                onClick={() => setIsMoveToCollectionOpen?.(true)}
                className="px-4 py-2 w-full text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
              >
                Choose Collection
              </Button>
            </Form.Field>

            <Card>
              <CardContent className="p-4">
                <h4 className="mb-2 text-sm font-medium">
                  JSON Format Preview
                </h4>
                <pre className="overflow-x-auto p-4 text-sm bg-gray-50 rounded-lg select-auto">
                  {JSON.stringify(sampleCardJson, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {cards.length} cards loaded
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddCardModalOpen(false)}
                  type="button"
                  variant="danger"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMultiCardSubmit}
                  disabled={cards.length === 0}
                >
                  Create {cards.length} Cards
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

export default React.memo(AddCardModal);
