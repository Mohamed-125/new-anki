import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";

import useGetCards, { CardType } from "../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import { TextType } from "./MyTexts";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";
import TipTapEditor from "@/components/TipTapEditor";
import useUseEditor from "@/hooks/useUseEditor";
import WordInfoSidebar from "@/components/WordInfoSidebar";
import { languageCodeMap } from "../languages";

const TextPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isWordInfoOpen, setIsWordInfoOpen] = useState<boolean>(false);
  const id = useParams()?.id;
  const { data: text, isLoading } = useQuery({
    queryKey: ["text", id],
    queryFn: async () => {
      const response = await axios.get("text/" + id);
      return response.data as TextType & { _id: string };
    },
  });

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
    if (!text?.content || !userCards?.length) return text?.content; // Return original text if no cards or content

    // Create a container to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(text.content, "text/html");

    // Recursive function to traverse and modify the text nodes
    const traverseNodes = (node: any) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.textContent;
        let modifiedText = originalText;

        userCards.forEach((card) => {
          const regex = new RegExp(`\\b(${card.front.trim()})\\b`, "gi"); // Use \b for word boundaries

          modifiedText = modifiedText.replace(
            regex,
            `<span class="highlight"  data-id=${card._id}>$1</span>` // Use "class" for raw HTML
          );
        });

        if (modifiedText !== originalText) {
          const wrapper = document.createElement("span");
          wrapper.innerHTML = modifiedText;
          node.replaceWith(...wrapper.childNodes);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(traverseNodes); // Traverse child nodes
      }
    };

    // Start traversing from the body of the parsed document
    Array.from(doc.body.childNodes).forEach(traverseNodes);

    return doc.body.innerHTML; // Return modified HTML as string
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
  const { selectionData } = useSelection();
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
  const queryClient = useQueryClient();

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
        <TranslationWindow
          setIsAddCardModalOpen={setIsAddCardModalOpen}
          setDefaultValues={setDefaultValues}
          setContent={setContent}
          isSameUser={isSameUser}
          selectionData={selectionData}
        />

        <div className="overflow-hidden bg-white rounded-xl shadow-sm">
          {/* Header courseLevel */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-2xl">
                {text?.title}
              </h1>
              <div className="flex items-center space-x-4">
                <ActionsDropdown
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
          <div className="flex divide-x divide-gray-200">
            {/* Text Content */}
            <div className="flex-1 px-6 py-4">
              <Text
                highlightText={highlightText}
                onCardClick={onCardClick}
                userCards={userCards}
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
  onCardClick,
}: {
  highlightText: string | undefined;
  userCards: CardType[] | undefined;
  onCardClick: (card: any) => void;
}) {
  const { editor, setContent } = useUseEditor(true);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { setDefaultValues, setIsAddCardModalOpen } = useModalsStates();
  const { selectedLearningLanguage } = useGetCurrentUser();

  useEffect(() => {
    if (highlightText) setContent(highlightText);
  }, [highlightText]);

  // Function to handle word click
  const handleWordClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    // Skip if clicking on an existing highlight (card)
    if (target.classList.contains("highlight")) {
      return;
    }

    // Get the clicked word
    const word = target.textContent?.trim();
    if (word && word.length > 1) {
      // Only process words with at least 2 characters
      setSelectedWord(word);
      setIsSidebarOpen(true);

      // If user holds Ctrl/Cmd key while clicking, open Reverso Context
      if (event.ctrlKey || event.metaKey) {
        const sourceLang =
          languageCodeMap[selectedLearningLanguage.toLowerCase()] || "english";
        const targetLang = "english"; // Default to English as target language
        openReversoPopup(word, sourceLang, targetLang);
      }
    }
  };

  // Function to handle adding a word to flashcards
  const handleAddWordToCards = (data: {
    front: string;
    back: string;
    content?: string;
  }) => {
    setDefaultValues({
      front: data.front,
      back: data.back,
      content: data.content,
    });
    setIsAddCardModalOpen(true);
  };

  return (
    <div className="text-div">
      <TipTapEditor editor={editor} onClick={handleWordClick} />

      {/* Word Info Sidebar
      <WordInfoSidebar
        word={selectedWord}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAddCard={handleAddWordToCards}
      /> */}

      <div className="mt-4 text-xs italic text-gray-500">
        Tip: Hold Ctrl/Cmd while clicking a word to open Reverso Context
        directly.
      </div>
      <style>{`
        .highlight {
          position: relative;
          background-color: rgba(255, 255, 0, 0.2);
          cursor: pointer;
          padding: 0 2px;
          border-radius: 2px;
          transition: background-color 0.2s;
        }
        .highlight:hover {
          background-color: rgba(255, 255, 0, 0.4);
        }
        
        /* Style for clickable words */
        .ProseMirror p {
          cursor: default;
        }
        
        .ProseMirror span[data-word] {
          cursor: pointer;
          display: inline-block;
          position: relative;
        }
        
        .ProseMirror span[data-word]:hover {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
});

export default TextPage;
