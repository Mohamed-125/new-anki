import AddCardModal from "../../components/AddCardModal";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import ReactDOM from "react-dom/client";

export type CaptionType = {
  dur: string;
  start: string;
  text: string;
};

const Video = () => {
  const id = useParams().id;
  const {
    data: video,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["video", id],
    queryFn: () => axios.get("video/" + id).then((res) => res.data),
  });

  const { user } = useGetCurrentUser();

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

  useEffect(() => {
    const container = document.createElement("div");
    //@ts-ignore
    const root = ReactDOM.createRoot(container);
    if (selectionData.ele && selectionData.text.length) {
      selectionData.ele.insertBefore(container, null);
      root.render(
        <TranslationWindow
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
      }, 0);
    };
  }, [selectionData]);

  const [defaultValues, setDefaultValues] = useState({
    front: "",
    back: "",
  });

  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [caption, setCaption] = useState<CaptionType[]>([]);
  const [actionsDivId, setActionsDivId] = useState("");
  const playerRef = useRef<any | null>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const subtitleContainerRef = useRef<HTMLDivElement | null>(null);

  const windowRef = useCallback((window: HTMLDivElement) => {
    if (window == null) return;
    setHeight(window.scrollHeight);
  }, []);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setCaption(video?.defaultCaptionData.transcript);
  }, [video]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div ref={windowRef} className="container flex gap-2 videoContainer ">
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
          refetch={refetch}
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
              setIsModalOpen={setIsAddCardModalOpen}
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

      <div className="relative w-full grow">
        <Subtitles
          setEditId={setEditId}
          selectionData={selectionData}
          video={video}
          playerRef={playerRef}
          caption={caption}
          setCaption={setCaption}
          handleSelection={handleSelection}
          subtitleContainerRef={subtitleContainerRef}
          setContent={setContent}
          setDefaultValues={setDefaultValues}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      </div>
    </div>
  );
};

export default Video;
