import { useQuery } from "@tanstack/react-query";
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

const TextPage = () => {
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container w-[90%]  border-2 border-light-gray p-4  mb-8 bg-white rounded-2xl sm:px-2 sm:text-base">
      <AddCardModal collectionId={text?.defaultCollectionId} />

      <TranslationWindow
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        selectionData={selectionData}
      />
      <div className="flex items-center justify-between gap-4 px-4 my-4 sm:flex-col">
        <h1 className="text-4xl font-bold ">{text?.title}</h1>
        <div className="flex gap-2">
          <Link to={`/texts/edit/${id}`} className="flex items-center gap-2">
            <Button variant="primary" className="flex items-center gap-2">
              <FaEdit className="text-lg cursor-pointer" /> Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => {
              deleteTextHandler();
            }}
            className="flex items-center gap-2"
          >
            <FaTrashCan className="text-lg text-white cursor-pointer" /> Delete
          </Button>
        </div>
      </div>

      <hr className="my-4"></hr>

      <Text
        highlightText={highlightText}
        onCardClick={onCardClick}
        userCards={userCards}
      />
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
        className="select-text"
        dangerouslySetInnerHTML={{ __html: highlightText || "" }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target?.classList.contains("highlight")) {
            const cardId = target.getAttribute("data-id");
            const card = userCards?.find((c: CardType) => c._id === cardId);
            if (card) onCardClick(card);
          }
        }}
      ></div>
    </div>
  );
});

export default TextPage;
