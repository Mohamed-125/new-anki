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

export type VideoType = {
  _id: string;
  title: string;
  url: string;
  availableCaptions: string[];
  defaultCaptionData: {
    name: string;
    transcript?: {
      dur: string;
      start: string;
      text: string;
    };
    translatedTranscript?: {
      dur: string;
      start: string;
      text: string;
    };
  };
  playlistId: string;
  thumbnail: string;
  userId: string;
};

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

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<VideoType[]>([]);
  const [availableCaptions, setAvailavailableCaptions] = useState<string[]>([]);
  const [acionsDivId, setActionsDivId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [changeItemsParent, setChangeItemsParent] = useState(false);

  useEffect(() => {
    setAvailavailableCaptions([]);
    document.querySelector("form")?.reset();
  }, [isVideoModalOpen]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container">
      {isVideoModalOpen && (
        <AddVideoModal
          setIsVideoModalOpen={setIsVideoModalOpen}
          defaultValues={defaultValues}
          isVideoModalOpen={isVideoModalOpen}
          // setDefaultValues={setDefaultValues}
        />
      )}

      <ChangeItemsParent
        changeItemsParent={changeItemsParent}
        setChangeItemsParent={setChangeItemsParent}
        itemsType={"video"}
        itemsIds={selectedItems}
        parentName="playlist"
      />

      <h1 className="my-6 text-4xl font-bold text-white">{playlist.name}</h1>
      {playlist?.playlistVideos?.length ? (
        <>
          <Search
            setState={setFilteredVideos}
            label={"Search your videos"}
            items={playlist?.playlistVideos}
            filter={"title"}
          />
          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none "
            onClick={() => setIsVideoModalOpen(true)}
          >
            Add new Video
          </Button>

          <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setChangeItemsParent={setChangeItemsParent}
            isItemsVideos={true}
          />

          <div className="">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                setActionsDivId={setActionsDivId}
                isActionDivOpen={acionsDivId === video._id}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                sideByside={true}
                setIsVideoModalOpen={setIsVideoModalOpen}
                defaultValues={defaultValues}
                setDefaultValues={setDefaultValues}
              />
            ))}
          </div>
          <Search.NotFound
            state={filteredVideos}
            searchFor={"video"}
            filter={"title"}
          />
        </>
      ) : (
        <Button onClick={() => setIsVideoModalOpen(true)}>
          No videos in this playlist add new Video
        </Button>
      )}
    </div>
  );
};

export default Playlist;
