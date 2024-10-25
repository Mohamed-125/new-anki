import AddCardModal from "../../components/AddCardModal";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import TranslationWindow from "../../components/TranslationWindow";
import useCreateNewCard from "../../hooks/useCreateNewCardMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// import useCreateNewCardMutation from "../hooks/useCreateNewCardMutation";
// import { createCardHandler } from "../hooks/useCreateNewCardMutation";
import Card from "../../components/Card";
import ReactYoutubeComponent from "./ReactYoutubeComponent";
import Subtitles from "./Subtitles";
import { CardType } from "../../hooks/useGetCards";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";

export type CaptionType = {
  dur: number;
  start: number;
  text: string;
};

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

  const { user } = useGetCurrentUser();
  if (isLoading) <Loading />;

  const { createCardHandler } = useCreateNewCard();

  const [selectionData, setSelectionData] = useState({
    ele: null as ParentNode | null,
    text: "",
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    document.body.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      target.tagName;
      if (
        document.querySelector("#translationWindow")?.contains(target) ||
        target.id === "translationWindow" ||
        target.tagName === "FORM" ||
        target.tagName === "DIALOG"
      ) {
      } else {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        setSelectionData({ ele: null, text: "" });
      }
    });
  }, []);

  const handleSelection = () => {
    const selected = window.getSelection();

    if (selected && selected.focusNode) {
      const focusNode = selected.focusNode as HTMLElement | null; // Explicit casting
      const anchorNode = selected.anchorNode as HTMLElement | null; // Explicit casting

      const parentNode =
        focusNode?.nodeName === "#text"
          ? focusNode?.parentNode
          : focusNode?.children?.[0] || anchorNode?.parentNode || null;

      setSelectionData({
        ele: parentNode, // This will either be an element or null
        text: selected.toString(),
      });
    }
  };

  const [defaultValues, setDefaultValues] = useState({
    front: "",
    back: "",
  });

  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [caption, setCaption] = useState<CaptionType[]>([]);
  const [actionsDivId, setActionsDivId] = useState("");
  const playerRef = useRef<any | null>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const subtitleContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="container flex gap-2 videoContainer ">
      <div className="w-full grow ">
        {/* add Modal */}

        <AddCardModal
          isAddCardModalOpen={isAddCardModalOpen}
          defaultValues={defaultValues}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
          setContent={setContent}
          editId={editId}
          setEditId={setEditId}
          setDefaultValues={setDefaultValues}
          videoId={id}
          content={content}
        />

        <ReactYoutubeComponent
          playerRef={playerRef}
          onReady={onReady}
          caption={caption}
          video={video}
          subtitleContainerRef={subtitleContainerRef}
        />
        <div className="mt-5">
          {video?.videoCards?.map((card: CardType) => (
            <Card
              isSameUser={user?._id === card.userId}
              setEditId={setEditId}
              setContent={setContent}
              setIsAddCardModalOpen={setIsAddCardModalOpen}
              setDefaultValues={setDefaultValues}
              key={card._id}
              card={card}
              id={card._id}
              setActionsDivId={setActionsDivId}
              isActionDivOpen={actionsDivId === card._id}
            />
          ))}
        </div>
      </div>

      {selectionData.text.trim()?.length ? (
        <TranslationWindow
          setDefaultValues={setDefaultValues}
          selectionData={selectionData}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      ) : null}

      <div className="relative w-full grow">
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
