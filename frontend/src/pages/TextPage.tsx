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
          return `<span class="relative word" data-number=${
            i + 1
          } data-text="${word}">${word}</span>`;
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

  // const { isTranslationBoxOpen, setIsTranslationBoxOpen } = useModalsStates();

  let setIsTranslationBoxOpen = () => {};
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
    <div className="min-h-screen bg-white">
      <div className="container !px-0 !pt-10 !pb-0 mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-xl shadow-sm">
          {/* Main Content */}
          <div className="flex w-full divide-x divide-gray-200">
            {/* Text Content */}
            <div className="flex-1 w-full sm:px-0">
              <Text
                highlightText={highlightText}
                text={text}
                userCards={userCards}
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

import { Virtuoso } from "react-virtuoso";

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
  const { setDefaultValues, setIsAddCardModalOpen, setIsTranslationBoxOpen } =
    useModalsStates();
  const { selectionData, setSelectionData } = useSelection();
  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === text?.userId;

  useEffect(() => {
    if (highlightText) setContent(highlightText);
  }, [highlightText]);

  const paragraphs = useMemo(() => {
    if (!highlightText) return [];

    const doc = new DOMParser().parseFromString(highlightText, "text/html");

    // Get all block-level elements and text nodes directly under body
    const nodes = Array.from(doc.body.childNodes);

    return nodes
      .map((node) => {
        // For element nodes, get their outer HTML
        if (node.nodeType === Node.ELEMENT_NODE) {
          return (node as Element).outerHTML;
        }
        // For text nodes, wrap them in a paragraph
        else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          return `<p>${node.textContent}</p>`;
        }
        return "";
      })
      .filter((html) => html.trim() !== ""); // Filter empty content
  }, [highlightText]);

  // getWordBefore
  const getWordBefore = useCallback(
    (
      currentNumber: number,
      collectedWords: string[] = [],
      count: number = 0
    ): string[] => {
      if (count >= 10) return collectedWords;

      const prevWord = document.querySelector(
        `[data-number="${currentNumber - 1}"]`
      ) as HTMLElement;

      if (prevWord) {
        collectedWords.unshift(prevWord.dataset.text || "");
        return getWordBefore(currentNumber - 1, collectedWords, count + 1);
      }

      return collectedWords;
    },
    [] // dependencies (empty if the function doesn't use any external reactive state)
  );

  // getWordAfter
  const getWordAfter = useCallback(
    (
      currentNumber: number,
      collectedWords: string[] = [],
      count: number = 0
    ): string[] => {
      if (count >= 10) return collectedWords;

      const nextWord = document.querySelector(
        `[data-number="${currentNumber + 1}"]`
      ) as HTMLElement;

      if (nextWord) {
        collectedWords.push(nextWord.dataset.text || "");
        return getWordAfter(currentNumber + 1, collectedWords, count + 1);
      }

      return collectedWords;
    },
    []
  );

  // onWordClick
  const onWordClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName !== "SPAN" || !target.dataset.number) return;

      const wordIndex = parseInt(target.dataset.number || "0", 10);
      const clickedWord = target.dataset.text;
      const beforeWords = getWordBefore(wordIndex);
      const afterWords = getWordAfter(wordIndex);

      const text = [...beforeWords, `((${clickedWord}))`, ...afterWords].join(
        " "
      );

      if (target.classList.contains("highlight")) {
        const card = userCards?.find(
          (userCard) => userCard._id === target.dataset.id
        );
        setDefaultValues({
          front: card?.front,
          back: card?.back,
          content: card?.content,
        });
        setIsAddCardModalOpen(true);
        return;
      }

      if (target.classList.contains("word")) {
        const word = target.dataset.text;
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNode(target.childNodes[0] as Node);
          selection.removeAllRanges();
          selection.addRange(range);

          if (word) {
            setSelectionData({
              text: word,
              selection: selection,
            });
            setIsTranslationBoxOpen(true);
          }
        }
      }
    },
    [getWordBefore, getWordAfter, userCards] // include dependencies if used from state or props
  );

  return (
    <>
      <TranslationWindow
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        selectionData={selectionData}
      />
      <AddCardModal collectionId={text?.defaultCollectionId} />

      <div className="tiptap tiptap-editor">
        <div className="text-div">
          {/* <TipTapEditor editor={editor} /> */}
          <Virtuoso
            style={{ height: "100vh", width: "100%" }}
            useWindowScroll
            totalCount={paragraphs.length}
            className="ProseMirror !p-0"
            itemContent={(index) => (
              <div
                className="px-6 sm:px-3 paragraph last:mb-10"
                dangerouslySetInnerHTML={{
                  __html: paragraphs[index],
                }}
                onClick={onWordClick}
              />
            )}
          />
        </div>
        {/* <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores
          temporibus exercitationem quo inventore. Repellendus repellat atque
          quas. Quae illo quidem tempora similique tenetur impedit non ex
          dolore, ipsam laudantium voluptas.
        </p> */}
        {/* <div className="tiptap tiptap-editor">
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
        </div> */}
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
