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
import { FaCheckCircle } from "react-icons/fa";

export type CaptionType = {
  duration: number;
  offset: number;
  text: string;
};

const Video = () => {
  const id = useParams().id;
  const [isCompleted, setIsCompleted] = useState(false);
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

  const [caption, setCaption] = useState<CaptionType[]>([]);
  const queryClient = useQueryClient();
  const playerRef = useRef<any | null>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const subtitleContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (video) {
      setCaption(video?.defaultCaptionData?.transcript);
    }
  }, [video]);
  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === video?.userId;
  useEffect(() => {
    if (video && !isSameUser) {
      const addToUserVideos = async () => {
        try {
          await axios.post(`video/fork/${video._id}`);
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        } catch (err) {
          console.error("Failed to add video to user's videos", err);
        }
      };
      addToUserVideos();
    }
  }, [video, user, isSameUser]);

  const { data: userList } = useQuery({
    queryKey: ["userList", video?.listId],
    queryFn: () =>
      axios.get(`/list/user/${video?.listId}`).then((res) => res.data),
    enabled: Boolean(video?.listId),
  });

  useEffect(() => {
    if (userList?.completedVideos) {
      setIsCompleted(userList.completedVideos.includes(id));
    }
  }, [userList, id]);

  const toggleComplete = async () => {
    try {
      await axios.post(`/list/user/${video?.listId}/complete-video/${id}`);
      setIsCompleted(!isCompleted);
      queryClient.invalidateQueries({ queryKey: ["userList"] });
    } catch (error) {
      console.error("Error toggling video completion:", error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container flex gap-2 videoContainer">
      <div className="w-full grow">
        <div className="flex gap-2 justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{video?.title}</h2>
        </div>
        <button
          onClick={toggleComplete}
          className={`flex mb-5 items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isCompleted
              ? "text-green-600 bg-green-100"
              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <FaCheckCircle
            className={`${isCompleted ? "text-green-600" : "text-gray-400"}`}
          />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </button>
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
