import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import ReactQuill from "react-quill";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";
import useCardActions from "../hooks/useCardActions";
import ReactDOM from "react-dom/client";
import { px } from "framer-motion";
import useGetCards, { CardType } from "../hooks/useGetCards";

const TextPage = () => {
  const id = useParams()?.id;
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [editId, setEditId] = useState("");
  const { data: text = {}, isLoading } = useQuery({
    queryKey: ["text", id],
    queryFn: async () => {
      const response = await axios.get("text/" + id);
      return response.data;
    },
  });

  const { data: userCards } = useGetCards();

  const modules = {
    toolbar: false, // Snow includes toolbar by default
  };

  useEffect(() => {}, [text?.content]);
  const navigate = useNavigate();

  const deleteTextHandler = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this text?"
    );
    if (confirm) {
      await axios.delete(`text/${id}`);
      navigate("/myTexts", { replace: true });
    }
  };

  const [selectionData, setSelectionData] = useState({
    ele: null,
    text: "",
  });

  const [defaultValues, setDefaultValues] = useState({});
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    document.body.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement)?.id !== "translationWindow") {
        window.getSelection()?.removeAllRanges();
        setSelectionData({ ele: null, text: "" });
      }
    });
  }, []);

  const handleSelection = () => {
    const selected = window.getSelection();
    if (!selected) return;
    const focusNode = selected.focusNode as HTMLElement;
    const anchorNode = selected.anchorNode as HTMLElement;

    setSelectionData({
      //@ts-ignore
      ele:
        focusNode?.nodeName === "#text"
          ? focusNode.parentNode
          : focusNode?.children[0] ?? anchorNode?.parentNode,
      text: selected.toString(),
    });
  };

  useEffect(() => {
    console.log("isAddCardModalOpen", isAddCardModalOpen);
  }, [isAddCardModalOpen]);

  useEffect(() => {
    const container = document.createElement("div");
    //@ts-ignore
    const root = ReactDOM.createRoot(container);

    container.style.position = "absolute";
    const element = selectionData?.ele;
    //@ts-ignore
    const rect = element?.getBoundingClientRect();
    container.style.top = `${rect?.bottom - rect?.top}px`;
    if (selectionData.ele && selectionData.text.length) {
      //@ts-ignore
      selectionData.ele?.insertBefore(container, null);
      root.render(
        <TranslationWindow
          text={true}
          selectionData={selectionData}
          setContent={setContent}
          setDefaultValues={setDefaultValues}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      );
    }
    return () => {
      // Defer the unmount to avoid unmounting during the render cycle
      setTimeout(() => {
        root.unmount();
        container.remove(); // Remove the container from the DOM
      }, 150);
    };
  }, [selectionData]);

  const highlightText = useMemo(() => {
    if (!text?.content || !userCards?.length) return text?.content; // Return original text if no cards or content

    // Create a container to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(text.content, "text/html");

    // Recursive function to traverse and modify the text nodes
    const traverseNodes = (node) => {
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

  const onCardClick = (card: any) => {
    setDefaultValues({
      front: card.front,
      back: card.back,
      content: card?.content,
    });
    setEditId(card._id);
    setIsAddCardModalOpen(true);
  };

  useEffect(() => {
    console.log("editId", editId);
  }, [editId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container p-4 w-[90%] rounded-lg mt-5 mb-8 bg-white !text-xl">
      <AddCardModal
        editId={editId}
        setEditId={setEditId}
        isAddCardModalOpen={isAddCardModalOpen}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
        content={content}
        setContent={setContent}
      />

      <h1 className="my-8 text-4xl font-bold ">{text?.title}</h1>
      <div className="flex items-center justify-end gap-4 my-4">
        <Link to={`/edit-text/${id}`} className="flex items-center gap-2">
          <FaEdit className="text-3xl text-blue-600 cursor-pointer" /> Edit
        </Link>
        <Button
          variant="danger"
          onClick={() => {
            deleteTextHandler();
          }}
          className="flex items-center gap-2"
        >
          <FaTrashCan className="text-3xl text-white cursor-pointer" /> Delete
        </Button>
      </div>

      <hr className="my-4"></hr>
      <div
        className="text-div"
        onMouseUp={(e) => {
          selectionData.text
            ? () => {
                window.getSelection()!.removeAllRanges();
                setSelectionData({ ele: null, text: "" });
              }
            : handleSelection();
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: highlightText }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target?.classList.contains("highlight")) {
              const cardId = target.getAttribute("data-id");
              const card = userCards.find((c: CardType) => c._id === cardId);
              if (card) onCardClick(card);
            }
          }}
        ></div>

        {/* <ChunkedContent content={text?.content} /> */}
      </div>
    </div>
  );
};

export default TextPage;
