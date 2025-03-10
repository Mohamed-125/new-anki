import React, { useState } from "react";
import AddVideoModal from "../components/AddVideoModal";
import Button from "../components/Button";
import VideoCard from "../components/VideoCard";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import VideoSkeleton from "@/components/VideoSkeleton";
import useGetVideos from "@/hooks/useGetVideos";
import useDebounce from "@/hooks/useDebounce";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const Videos = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
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

  return (
    <div>
      {/* <AddVideoModal
        setIsVideoModalOpen={setIsVideoModalOpen}
        defaultValues={defaultValues}
        isVideoModalOpen={isVideoModalOpen}
      /> */}

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

          <SelectedItemsController isItemsVideos={true} />

          <div className="grid gap-3 grid-container videos-container">
            {videos?.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
            {(isInitialLoading || isFetchingNextPage) && <VideoSkeleton />}
          </div>
        </>
      </div>
    </div>
  );
};

export default Videos;
