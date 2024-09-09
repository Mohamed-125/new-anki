import AddCardModal from "../../components/AddCardModal";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import TranslationWindow from "./TranslationWindow";
import YouTube from "react-youtube"; // Assuming you have a YouTube player library
import useCreateNewCard from "../../hooks/useCreateNewCardMutation";
import { useQuery } from "@tanstack/react-query";
// import useCreateNewCardMutation from "../hooks/useCreateNewCardMutation";
// import { createCardHandler } from "../hooks/useCreateNewCardMutation";
import JoditEditor from "jodit-react";
import Card from "../../components/Card";
import useCardActions from "../../hooks/useCardActions";
import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";
import ReactYoutubeComponent from "./ReactYoutubeComponent";
import Subtitles from "./Subtitles";

const Video = () => {
  const id = useParams().id;

  const {
    data: video,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["video", id],
    queryFn: () => axios.get("video/" + id).then((res) => res.data),
  });

  if (isLoading) <Loading />;

  const { createCardHandler } = useCreateNewCard();

  const [selectionData, setSelectionData] = useState({
    ele: null,
    text: "",
  });

  useEffect(() => {
    document.body.addEventListener("mousedown", (e) => {
      if (
        document.querySelector("#translationWindow")?.contains(e.target) ||
        e.target.id === "translationWindow" ||
        e.target === "form" ||
        e.target === "dialog"
      ) {
      } else {
        window.getSelection().removeAllRanges();
        setSelectionData({ ele: null, text: "" });
      }
    });
  }, []);

  const handleSelection = (e) => {
    const selected = window.getSelection();
    console.log(selected.focusNode.nodeName === "#text", selected);
    setSelectionData({
      ele:
        selected.focusNode.nodeName === "#text"
          ? selected.focusNode.parentNode
          : selected.focusNode.children[0],
      text: selected.toString(),
    });
  };

  const [defaultValues, setDefaultValues] = useState({
    word: "",
    translation: "",
  });

  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [caption, setCaption] = useState([]);

  const playerRef = useRef(null);

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  const { deleteHandler, updateCardHandler } = useCardActions({
    setIsAddCardModalOpen,
    content,
    editId,
  });

  const subtitleContainerRef = useRef(null);

  return (
    <div className="container flex gap-2 ">
      <div className="basis-2/4">
        <ReactYoutubeComponent
          playerRef={playerRef}
          onReady={onReady}
          caption={caption}
          video={video}
          subtitleContainerRef={subtitleContainerRef}
        />
        <div className="mt-5">
          {video?.videoCards?.map((card) => (
            <Card
              setEditId={setEditId}
              setContent={setContent}
              content={content}
              setIsAddCardModalOpen={setIsAddCardModalOpen}
              setDefaultValues={setDefaultValues}
              key={card._id}
              front={card.word}
              examples={card.examples}
              back={card.translation}
              deleteHandler={deleteHandler}
              setIsEdit={setIsEdit}
              id={card._id}
            />
          ))}
        </div>
      </div>

      {/* add Modal */}

      <AddCardModal
        isAddCardModalOpen={isAddCardModalOpen}
        defaultValues={defaultValues}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setContent={setContent}
        isEdit={editId}
        setEditId={setEditId}
        updateCardHandler={updateCardHandler}
        setDefaultValues={setDefaultValues}
        createCardHandler={(e) => {
          createCardHandler(e, { videoId: id }, setIsAddCardModalOpen, () =>
            queryClient.invalidateQueries(["video/" + id])
          );
        }}
        content={content}
      />

      {selectionData.text?.length ? (
        <TranslationWindow
          setDefaultValues={setDefaultValues}
          selectionData={selectionData}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      ) : null}

      <div className="relative grow">
        <Subtitles
          selectionData={selectionData}
          video={video}
          playerRef={playerRef}
          caption={caption}
          setCaption={setCaption}
          handleSelection={handleSelection}
          subtitleContainerRef={subtitleContainerRef}
        />
      </div>
    </div>
  );
};

export default Video;
