import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import AddVideoModal from "../components/AddVideoModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import VideoCard from "../components/VideoCard";
import Search from "../components/Search";

const Videos = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [availableCaptions, setAvailavailableCaptions] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [acionsDivId, setActionsDivId] = useState("");

  useEffect(() => {
    setAvailavailableCaptions([]);
    document.querySelector("form")?.reset();
  }, [isVideoModalOpen]);

  const {
    data: videos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: () => axios.get("video").then((res) => res.data),
  });

  console.log(videos);

  if (isLoading) <Loading />;

  const queryClient = useQueryClient();

  const deleteHandler = (id) => {
    axios
      .delete(`video/${id}`)
      .then((res) => {
        console.log(res.data);
        queryClient.invalidateQueries("videos");
      })
      .catch((err) => console.log(err));
  };
  return (
    <div>
      {isVideoModalOpen && (
        <AddVideoModal
          availableCaptions={availableCaptions}
          setAvailavailableCaptions={setAvailavailableCaptions}
          setIsVideoModalOpen={setIsVideoModalOpen}
        />
      )}
      <div className="container">
        {videos?.length ? (
          <>
            <Search
              setState={setFilteredVideos}
              label={"Search your videos"}
              items={videos}
              filter={"title"}
              state={filteredVideos}
            />

            <Button
              className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none "
              onClick={() => setIsVideoModalOpen(true)}
            >
              Add new Video
            </Button>
            <div className="grid gap-3 grid-container">
              {filteredVideos.map((video) => (
                <VideoCard
                  deleteHandler={deleteHandler}
                  key={video._id}
                  video={video}
                  setActionsDivId={setActionsDivId}
                  isActionDivOpen={acionsDivId === video._id}
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
