import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";
import useGetCards, { CardType } from "../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";
import TipTapEditor from "@/components/TipTapEditor";
import useUseEditor from "@/hooks/useUseEditor";
import { languageCodeMap } from "../../../languages";
import { TextType } from "@/hooks/useGetTexts";

const TextPage = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const id = useParams()?.id;
  const queryClient = useQueryClient();

  console.log("text page rerendered");
  const { data: text, isLoading } = useQuery({
    queryKey: ["text", id],
    queryFn: async () => {
      const response = await axios.get("text/" + id);
      return response.data as TextType & { _id: string };
    },
  });

  const { data: userList } = useQuery({
    queryKey: ["userList", text?.listId],
    queryFn: () =>
      axios.get(`/list/user/${text?.listId}`).then((res) => res.data),
    enabled: Boolean(text?.listId),
  });

  useEffect(() => {
    if (userList?.completedTexts) {
      setIsCompleted(userList.completedTexts.includes(id));
    }
  }, [userList, id]);

  const toggleComplete = async () => {
    try {
      await axios.post(`/list/user/${text?.listId}/complete-text/${id}`);
      setIsCompleted(!isCompleted);
      queryClient.invalidateQueries({ queryKey: ["userList"] });
    } catch (error) {
      console.error("Error toggling text completion:", error);
    }
  };

  const { userCards } = useGetCards({});

  const navigate = useNavigate();

  const deleteTextHandler = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this text?"
    );
    if (confirm) {
      await axios.delete(`text/${id}`);
      navigate("/texts", { replace: true });
    }
  };

  const { setDefaultValues, setIsAddCardModalOpen, setContent } =
    useModalsStates();

  const highlightText = useMemo(() => {
    if (!text?.content) return text?.content;

    const parser = new DOMParser();
    const doc = parser.parseFromString(text.content, "text/html");

    const traverseNodes = (node: any) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.textContent;
        const words = originalText.split(/\s+/);

        const processedWords = words.map((word, i) => {
          if (!word.trim()) return word; // Keep whitespace as is

          // Check if word matches any card
          const matchingCard = userCards?.find((card) =>
            new RegExp(`^${card.front.trim()}$`, "i").test(word)
          );

          if (matchingCard) {
            return `<span class="highlight" data-number=${i + 1} data-id=${
              matchingCard._id
            }>${word}</span>`;
          }

          // Wrap non-matching words in clickable spans
          return word;
        });

        const wrapper = document.createElement("span");
        wrapper.innerHTML = processedWords.join(" ");
        node.replaceWith(...wrapper.childNodes);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(traverseNodes);
      }
    };

    Array.from(doc.body.childNodes).forEach(traverseNodes);
    return doc.body.innerHTML;
  }, [text?.content, userCards]);

  const onCardClick = useCallback(
    (card: any) => {
      setDefaultValues({
        front: card.front,
        back: card.back,
        content: card?.content,
      });
      setIsAddCardModalOpen(true);
    },
    [setDefaultValues, setIsAddCardModalOpen]
  );

  const { isTranslationBoxOpen, setIsTranslationBoxOpen } = useModalsStates();

  const handleWordClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("word")) {
      const text = target.dataset.text;

      if (text) {
        setIsTranslationBoxOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleWordClick);
    return () => document.removeEventListener("click", handleWordClick);
  }, [handleWordClick]);

  const { setIsShareModalOpen, setShareItemId, setShareItemName } =
    useModalsStates();
  const shareHandler = () => {
    if (!text) return;
    setIsShareModalOpen(true);
    setShareItemId(text._id);
    setShareItemName(text?.title);
  };
  const { setSelectedItems } = useModalsStates();
  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === text?.userId;
  const { addToast } = useToasts();

  const forkHandler = async () => {
    const toast = addToast("Forking text...", "promise");
    try {
      const response = await axios.post(`text/fork/${text?._id}`);
      navigate(`/texts/${response.data._id}`);
      queryClient.invalidateQueries({ queryKey: ["texts"] });
      toast.setToastData({
        title: "Text forked successfully!",
        type: "success",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to fork text", type: "error" });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <AddCardModal collectionId={text?.defaultCollectionId} />
        <ShareModal sharing="texts" />

        <div className="overflow-hidden bg-white rounded-xl shadow-sm">
          {/* Header courseLevel */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-2xl">
                {text?.title}
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleComplete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isCompleted
                      ? "text-green-600 bg-green-100"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <FaCheckCircle
                    className={`${
                      isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  {isCompleted ? "Completed" : "Mark as Complete"}
                </button>
                <ActionsDropdown
                  setSelectedItems={setSelectedItems}
                  itemId={text?._id as string}
                  shareHandler={shareHandler}
                  forkData={
                    isSameUser || text?.topicId
                      ? undefined
                      : {
                          forking: "Add to your texts",
                          handler: forkHandler,
                        }
                  }
                  isSameUser={isSameUser}
                  editHandler={() => {
                    navigate(`/texts/edit/${id}`);
                  }}
                  deleteHandler={deleteTextHandler}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex w-full divide-x divide-gray-200">
            {/* Text Content */}
            <div className="flex-1 px-4 w-full sm:px-0">
              <Text
                highlightText={highlightText}
                userCards={userCards}
                text={text}
                // setSelectionData={setSelectionData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to open Reverso Context in a popup window
const openReversoPopup = (
  word: string,
  sourceLang: string,
  targetLang: string
) => {
  const url = `https://context.reverso.net/translation/${sourceLang}-${targetLang}/${encodeURIComponent(
    word
  )}`;
  window.open(url, "_blank", "width=800,height=600");
};

const Text = React.memo(function ({
  highlightText,
  userCards,
  text,
}: {
  highlightText: string | undefined;
  userCards: CardType[] | undefined;
  text: TextType | undefined;
}) {
  const { editor, setContent } = useUseEditor(true);
  const { setDefaultValues, setIsAddCardModalOpen } = useModalsStates();
  const { selectionData, setSelectionData } = useSelection();
  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === text?.userId;

  useEffect(() => {
    if (highlightText) setContent(highlightText);
  }, [highlightText]);

  console.log("text renedered");
  return (
    <>
      <TranslationWindow
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        isSameUser={isSameUser}
        selectionData={selectionData}
      />

      <div className="text-div">
        {/* <TipTapEditor editor={editor} /> */}
        <div className="tiptap tiptap-editor">
          <div
            className="relative ProseMirror"
            dangerouslySetInnerHTML={{
              __html: highlightText as string | TrustedHTML,
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName !== "SPAN") {
                return;
              }

              const word = target.textContent?.trim();
              const isHighlighted = target.classList.contains("highlight");
              const rect = target.getBoundingClientRect();
              const clean = (str: string) => str.replace(/[()]/g, "");

              if (!word) return;

              if (isHighlighted) {
                const cardId = target.dataset.id;
                const card = userCards?.find((c) => c._id === cardId);
                if (card) {
                  setDefaultValues({
                    front: card.front,
                    back: card.back,
                    content: card?.content,
                  });
                  setIsAddCardModalOpen(true);
                }
              }
            }}
          ></div>
        </div>
        {/* Word Info Sidebar
      <WordInfoSidebar
        word={selectedWord}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAddCard={handleAddWordToCards}
      /> */}
      </div>
    </>
  );
});

export default TextPage;
