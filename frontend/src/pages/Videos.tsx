import React, { useState } from "react";
import AddVideoModal from "../components/AddVideoModal";
import Button from "../components/Button";
import VideoCard from "../components/VideoCard";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import VideoSkeleton from "@/components/VideoSkeleton";
import useGetVideos from "@/hooks/useGetVideos";
import useDebounce from "@/hooks/useDebounce";
import useInfiniteScroll from "@/components/InfiniteScroll";
import MoveVideoModal from "@/components/MoveVideoModal";
import ShareModal from "@/components/ShareModal";

const Videos = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    videos,
    videosCount,
    fetchNextPage,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useGetVideos({ query: debouncedQuery });

  useInfiniteScroll(fetchNextPage, hasNextPage);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState("");

  const moveVideosHandler = (id: string) => {
    console.log("id", id);
    setIsOpen(true);
    setEditId(id);
  };

  return (
    <div>
      {/* <AddVideoModal
        setIsVideoModalOpen={setIsVideoModalOpen}
        defaultValues={defaultValues}
        isVideoModalOpen={isVideoModalOpen}
      /> */}
      <SelectedItemsController
        setMoveVideoModal={setIsOpen}
        isItemsVideos={true}
      />

      <ShareModal sharing="video" />
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
            {videos?.map((video) => {
              return (
                <VideoCard
                  moveVideoHandler={() => moveVideosHandler(video._id)}
                  key={video._id}
                  video={video}
                />
              );
            })}
            {(isInitialLoading || isFetchingNextPage) && <VideoSkeleton />}
          </div>
        </>
      </div>
    </div>
  );
};

export default Videos;
