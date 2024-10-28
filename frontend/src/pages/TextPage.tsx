import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
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

const TextPage = () => {
  const id = useParams()?.id;
  const [targetLanguage, setTargetLanguage] = useState("en");

  const { data: text = {}, isLoading } = useQuery({
    queryKey: ["text", id],
    queryFn: async () => {
      const response = await axios.get("text/" + id);
      return response.data;
    },
  });

  const { mutate, data: trarnslatedText = "" } = useMutation({
    mutationFn: async (text) => {
      const response = await axios.post(
        `translate?targetLanguage=${targetLanguage}`,
        {
          text,
        }
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (text?.content) {
      mutate(text.content);
    }
  }, [text]);
  const modules = {
    toolbar: false, // Snow includes toolbar by default
  };

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
        ("closing");
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
        focusNode.nodeName === "#text"
          ? focusNode.parentNode
          : focusNode.children[0] ?? anchorNode.parentNode,
      text: selected.toString(),
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container p-4 w-[90%] rounded-lg mt-5 mb-8 bg-white !text-xl">
      <AddCardModal
        isAddCardModalOpen={isAddCardModalOpen}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        defaultValues={defaultValues}
        setDefaultValues={setDefaultValues}
        content={content}
        setContent={setContent}
      />

      {selectionData.text.trim()?.length ? (
        <TranslationWindow
          setDefaultValues={setDefaultValues}
          selectionData={selectionData}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      ) : null}

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
        className=""
        onMouseUp={(e) => {
          selectionData.text
            ? () => {
                ("removing selection");
                window.getSelection()!.removeAllRanges();
                setSelectionData({ ele: null, text: "" });
              }
            : handleSelection();
        }}
      >
        <ReactQuill modules={modules} value={text?.content} readOnly={true} />
      </div>

      <hr className="my-4"></hr>
      <h1 className="my-8 text-4xl font-bold ">Translated Text</h1>
      <div
        dangerouslySetInnerHTML={{ __html: trarnslatedText }}
        className="translate-text"
      ></div>
    </div>
  );
};

export default TextPage;
