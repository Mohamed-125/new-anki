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
          video={video}
          isAddCardModalOpen={isAddCardModalOpen}
          setContent={setContent}
          playerRef={playerRef}
          caption={caption}
          setCaption={setCaption}
          subtitleContainerRef={subtitleContainerRef}
          setDefaultValues={setDefaultValues}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      </div>
    </div>
  );
};

export default Video;
