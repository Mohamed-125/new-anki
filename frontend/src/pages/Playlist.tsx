import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import axios from "axios";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import AddVideoModal from "../components/AddVideoModal";
import Search from "../components/Search";
import VideoCard from "../components/VideoCard";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent.tsx";
import { CaptionType } from "./video/Video.tsx";
import useDebounce from "@/hooks/useDebounce.tsx";
import useGetVideos from "@/hooks/useGetVideos.tsx";
import useInfiniteScroll from "@/hooks/useInfiniteScroll.tsx";
import MoveVideoModal from "@/components/MoveVideoModal.tsx";
import ItemCard from "@/components/ui/ItemCard.tsx";
import { MdOutlinePlaylistPlay } from "react-icons/md";
import useToasts from "@/hooks/useToasts.tsx";
import VideoSkeleton from "@/components/VideoSkeleton.tsx";

const Playlist = () => {
  const { id: playlistId } = useParams();

  const fetchPlaylist = async (playlistId: string) => {
    const res = await axios.get(`playlist/${playlistId}`);
    return res.data;
  };

  const queryClient = useQueryClient();

  const {
    data: playlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => fetchPlaylist(playlistId as string),
  });

  console.log(playlist);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    videos,
    videosCount,
    fetchNextPage,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useGetVideos({ query: debouncedQuery, playlistId });

  useInfiniteScroll(fetchNextPage, hasNextPage);
  const [isOpen, setIsOpen] = useState(false);

  const { addToast } = useToasts();
  const deletePlaylistHandler = (playlistId: string) => {
    const toast = addToast("Deleting playlist...", "promise");
    axios
      .delete(`playlist/${playlistId}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
        toast.setToastData({
          title: "Playlist deleted successfully!",
          isCompleted: true,
        });
      })
      .catch(() => {
        toast.setToastData({
          title: "Failed to delete playlist",
          type: "error",
        });
      });
  };

  const [editId, setEditId] = useState("");

  if (isLoading) {
    return <Loading />;
  }
  const moveVideosHandler = (id: string) => {
    setIsOpen(true);
    setEditId(id);
  };
  return (
    <div>
      <SelectedItemsController
        setMoveVideoModal={setIsOpen}
        isItemsVideos={true}
      />

      <MoveVideoModal editId={editId} isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="container">
        <>
          <Search query={query} setQuery={setQuery} searchingFor="videos" />
          <h6 className="mt-4 mb-6 text-lg font-bold text-gray-400">
            Number of videos : {videosCount}
          </h6>
          {/* <Button
            className="py-4 my-6 mr-0 ml-auto text-white bg-blue-600 border-none"
            onClick={() => setIsVideoModalOpen(true)}
          >
            Add new Video
          </Button> */}

          <div className="grid gap-3 grid-container videos-container">
            {videos?.map((video) => (
              <VideoCard
                moveVideoHandler={() => moveVideosHandler(video._id)}
                key={video._id}
                video={video}
              />
            ))}
            {(isInitialLoading || isFetchingNextPage) && <VideoSkeleton />}
          </div>
        </>
      </div>
    </div>
  );
};

export default Playlist;
