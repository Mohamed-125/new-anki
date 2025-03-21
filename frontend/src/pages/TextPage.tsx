import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useMemo } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";

import useGetCards, { CardType } from "../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import { TextType } from "./MyTexts";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";

const TextPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
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
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to fork text", isError: true });
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
          {/* Header Section */}
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
                    isSameUser
                      ? undefined
                      : {
                          forking: "Add to your texts",
                          handler: forkHandler,
                        }
                  }
                  isSameUser={isSameUser}
                  editHandler={() => {
                    navigate("/texts/edit/${id}");
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

const Text = React.memo(function ({
  highlightText,
  userCards,
  onCardClick,
}: {
  highlightText: string | undefined;
  userCards: CardType[] | undefined;
  onCardClick: (card: any) => void;
}) {
  return (
    <div className="text-div">
      <div
        className="max-w-none leading-relaxed text-gray-800 select-text prose prose-lg"
        dangerouslySetInnerHTML={{ __html: highlightText || "" }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target?.classList.contains("highlight")) {
            const cardId = target.getAttribute("data-id");
            const card = userCards?.find((c: CardType) => c._id === cardId);
            if (card) onCardClick(card);
          }
        }}
        style={{
          fontSize: "1.125rem",
          lineHeight: "1.75",
        }}
      ></div>
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
      `}</style>
    </div>
  );
});

export default TextPage;
