import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";
import useGetCards from "../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";

const Video = () => {
  const id = useParams()?.id;
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const response = await axios.get("video/" + id);
      return response.data;
    },
  });

  const { userCards } = useGetCards({});
  const navigate = useNavigate();

  const deleteVideoHandler = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (confirm) {
      await axios.delete(`video/${id}`);
      navigate("/videos", { replace: true });
    }
  };

  const { setDefaultValues, setIsAddCardModalOpen, setContent } =
    useModalsStates();

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
  const { setIsShareModalOpen, setShareItemId, setShareItemName } =
    useModalsStates();

  const shareHandler = () => {
    if (!video) return;
    setIsShareModalOpen(true);
    setShareItemId(video._id);
    setShareItemName(video?.title);
  };

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === video?.userId;

  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const forkHandler = async () => {
    const toast = addToast("Forking video...", "promise");
    try {
      const response = await axios.post(`video/fork/${video._id}`);
      navigate(`/videos/${response.data._id}`);
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.setToastData({
        title: "Video forked successfully!",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to fork video", isError: true });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container w-[90%] border-2 border-light-gray p-4 mb-8 bg-white rounded-2xl sm:px-2 sm:text-base">
      <ShareModal sharing="videos" />
      <TranslationWindow
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        isSameUser={isSameUser}
        selectionData={selectionData}
      />
      <div className="flex gap-4 justify-between items-center px-4 my-4">
        <h1 className="text-3xl font-bold sm:text-xl">{video?.title}</h1>
        <div className="flex gap-2">
          <ActionsDropdown
            itemId={video?._id as string}
            shareHandler={shareHandler}
            isSameUser={isSameUser}
            forkData={{
              forking: "Add to your videos",
              handler: forkHandler,
            }}
            editHandler={() => {
              navigate(`/videos/edit/${id}`);
            }}
            deleteHandler={deleteVideoHandler}
          />
        </div>
      </div>

      <hr className="my-4"></hr>

      <div className="video-content">
        {/* Add video player or content here */}
      </div>
    </div>
  );
};

export default Video;
