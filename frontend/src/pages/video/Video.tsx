import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import TranslationWindow from "@/components/TranslationWindow";
import AddCardModal from "@/components/AddCardModal";
import useGetCards, { CardType } from "@/hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import Card from "@/components/Card";
import CardsSkeleton from "@/components/CardsSkeleton";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import SelectedItemsController from "@/components/SelectedItemsController";
import ReactYoutubeComponent from "./ReactYoutubeComponent";
import Subtitles from "./Subtitles";

export type CaptionType = {
  duration: number;
  offset: number;
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
  const { addToast } = useToasts();

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const playerRef = useRef<any | null>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const subtitleContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCaption(video?.defaultCaptionData.transcript);
  }, [video]);

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === video?.userId;

  const forkHandler = async () => {
    const toast = addToast("Forking video...", "promise");
    try {
      const response = await axios.post(`video/fork/${video._id}`);
      navigate(`/videos/${response.data._id}`);
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.setToastData({
        title: "Video forked successfully!",
        type: "success",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to fork video", type: "error" });
    }
  };

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
          {!isSameUser || !video?.topicId ? (
            <Button onClick={forkHandler} className="mb-7">
              Add to your videos
            </Button>
          ) : null}
          {isIntialLoading && <CardsSkeleton />}
          {videoCards?.map((card: CardType) => (
            <Card key={card._id} card={card} id={card._id} />
          ))}

          {isFetchingNextPage && <CardsSkeleton />}
        </div>
      </div>

      <div className="w-full grow">
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
