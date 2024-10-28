import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import AddVideoModal from "../components/AddVideoModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import VideoCard from "../components/VideoCard";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent.tsx";
import { VideoType } from "./Playlist.tsx";

const Videos = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<VideoType[]>([]);
  const [acionsDivId, setActionsDivId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [availableCaptions, setAvailavailableCaptions] = useState<string[]>([]);
  const [changeItemsParent, setChangeItemsParent] = useState(false);

  useEffect(() => {
    if (!isVideoModalOpen) {
      setDefaultValues([]);
      setAvailavailableCaptions([]);
      document.querySelector("form")?.reset();
    }
  }, [isVideoModalOpen]);

  const {
    data: videos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: () => axios.get("video").then((res) => res.data),
  });

  videos;

  if (isLoading) {
    return <Loading />;
  }

  const queryClient = useQueryClient();
  return (
    <div>
      <AddVideoModal
        setIsVideoModalOpen={setIsVideoModalOpen}
        defaultValues={defaultValues}
        availableCaptions={availableCaptions}
        isVideoModalOpen={isVideoModalOpen}
        setAvailavailableCaptions={setAvailavailableCaptions}
      />

      <ChangeItemsParent
        changeItemsParent={changeItemsParent}
        setChangeItemsParent={setChangeItemsParent}
        itemsType={"video"}
        itemsIds={selectedItems}
        parentName="playlist"
      />

      <div className="container">
        {videos?.length ? (
          <>
            <Search
              setState={setFilteredVideos}
              label={"Search your videos"}
              items={videos}
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
              isItemsVideos={true}
              setChangeItemsParent={setChangeItemsParent}
            />

            <div className="grid gap-3 grid-container videos-container">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  setActionsDivId={setActionsDivId}
                  isActionDivOpen={acionsDivId === video._id}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  defaultValues={defaultValues}
                  setDefaultValues={setDefaultValues}
                  setIsVideoModalOpen={setIsVideoModalOpen}
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
          <Button className="mt-11" onClick={() => setIsVideoModalOpen(true)}>
            There is not videos Add Your First Now
          </Button>
        )}{" "}
      </div>
    </div>
  );
};

export default Videos;
