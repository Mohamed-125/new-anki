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
import useGetCards, { CardType } from "../../hooks/useGetCards";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";
import ReactDOM from "react-dom/client";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import SelectedItemsController from "@/components/SelectedItemsController";
import CardsSkeleton from "@/components/CardsSkeleton";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";

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

  const {
    cardsCount,
    fetchNextPage,
    isIntialLoading,
    isFetchingNextPage,
    userCards: videoCards,
  } = useGetCards({
    enabled: Boolean(video?._id),
    videoId: video?._id,
  });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [caption, setCaption] = useState<CaptionType[]>([]);

  const playerRef = useRef<any | null>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const subtitleContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCaption(video?.defaultCaptionData.transcript);
  }, [video]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container flex gap-2 videoContainer">
      <div className="w-full grow">
        {/* add Modal */}
        {videoCards && (
          <>
            <MoveCollectionModal />

            <AddNewCollectionModal />

            <AddCardModal videoId={id} />
          </>
        )}
        <SelectedItemsController />

        <ReactYoutubeComponent
          playerRef={playerRef}
          onReady={onReady}
          caption={caption}
          video={video}
          subtitleContainerRef={subtitleContainerRef}
        />
        <div className="mt-5">
          {isIntialLoading && <CardsSkeleton />}
          {videoCards?.map((card: CardType) => (
            <Card key={card._id} card={card} id={card._id} />
          ))}

          {isFetchingNextPage && <CardsSkeleton />}
        </div>
      </div>

      <div className="relative w-full grow">
        <Subtitles
          video={video}
          playerRef={playerRef}
          caption={caption}
          setCaption={setCaption}
          subtitleContainerRef={subtitleContainerRef}
        />
      </div>
    </div>
  );
};

export default Video;
