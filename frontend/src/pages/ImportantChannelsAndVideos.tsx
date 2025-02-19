import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import AddVideoModal from "../components/AddVideoModal";
type Item = {
  duration: string;
  href: string;
  thumbnail: string;
  title: string;
};

type SelecetedChannelType = {
  channelName: string;
  channelThumbnail: string;
  channelVideosNum: number;
  items: Item[];
};

type ChanneslDataType = {
  [key: string]: {
    channelName: string;
    channelThumbnail: string;
    channelVideosNum: number;
    items: Item[];
  };
};

const ImportantChannelsAndVideos = () => {
  const [selectedChannel, setSelectedChannel] =
    useState<SelecetedChannelType>();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [openedVideo, setOpenedVideo] = useState("");

  const {
    data: channelsData,
    isLoading,
    error,
  }: {
    data: ChanneslDataType | undefined;
    isLoading: boolean;
    error: any;
  } = useQuery({
    queryKey: ["channels"],
    queryFn: () => axios.get("channels").then((res) => res.data),
  });

  useEffect(() => {
    if (typeof channelsData === "object") {
      if (Object.keys(channelsData).length > 0) {
        const firstChannel = Object.keys(channelsData)[0];
        setSelectedChannel(channelsData[firstChannel]);
      }
    }
  }, [channelsData]);

  const buttonIndex = selectedChannel?.channelThumbnail.lastIndexOf("/");
  const buttonLink = selectedChannel?.channelThumbnail.slice(buttonIndex);

  const containerRef = useRef<HTMLDivElement | null>(null);

  console.log(document.documentElement.scrollTop);
  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="container " ref={containerRef}>
      <h1 className="my-6 text-3xl font-bold text-black mb-11">
        Important German Channels and Videos
      </h1>
      <AddVideoModal
        isVideoModalOpen={isVideoModalOpen}
        setIsVideoModalOpen={setIsVideoModalOpen}
        defaultValues={defaultValues}
        className={` fixed z-[1000]  w-[95%] max-w-[800px] inset-[unset] left2/4 right-2/4 translate-x-2/4 -translate-y-2/4`}
        style={{
          // top: `calc(${
          //   // openedVideo ? document.documentElement.scrollTop : 0
          // }px `,
          top: "50vh",
        }}
        // Corrected this line
      />

      <div className="flex gap-7">
        <div className="w-[30%] h-fit border-r-2 bg-white border-gray-300 rounded-md">
          {channelsData &&
            Object.keys(channelsData)?.map((channel, index) => {
              const channelLogo = channelsData[channel].channelThumbnail;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 text-black border-b-2 border-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => setSelectedChannel(channelsData[channel])}
                >
                  <img
                    src={channelLogo}
                    className="w-[75px] h-[75px] rounded-full"
                  />
                  <div className="p-2">
                    <h2 className="text-xl font-bold">
                      {channelsData[channel].channelName}
                    </h2>
                    <p className="font-semibold text-gray-500">
                      {channelsData[channel].channelVideosNum}
                    </p>
                  </div>
                </div>
              );
            })}{" "}
        </div>

        <div className="w-[70%] rounded-md   flex flex-col gap-4">
          <div className="flex items-center gap-4 p-2 bg-white rounded-md">
            <img
              src={selectedChannel?.channelThumbnail}
              className="w-[125px] h-[125px] rounded-full"
            />
            <div className="flex flex-col gap-2">
              <h3>{selectedChannel?.channelName}</h3>
              <Button
                link={`https://www.youtube.com/channel/${buttonLink}`}
                target="_blank"
              >
                Go to this channel and watch more videos
              </Button>
            </div>
          </div>

          {selectedChannel?.items?.map((video, index) => {
            const videoLink = video.href.lastIndexOf("/yt_") + 4;
            const videoLinkId = video.href.slice(videoLink);

            const id = "video-" + videoLinkId;
            return (
              <div
                key={index}
                id={id}
                className="relative flex w-full gap-4 bg-white"
              >
                <div
                  className={`video-video-thumbnail  min-w-[40%]`}
                  style={{
                    backgroundImage: `${video.thumbnail}`, // Set background image inline
                    backgroundSize: "cover", // Ensure the image covers the div
                    backgroundPosition: "center", // Center the image
                  }}
                  data-duration={video.duration}
                ></div>
                <div className=" h-[220px] py-4 grow flex flex-col justify-between">
                  <div></div>
                  <p>{video.title}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      link={`https://www.youtube.com/watch?v=${videoLinkId}`}
                      target="_blank"
                    >
                      Go the youtube
                    </Button>
                    <Button
                      onClick={() => {
                        setIsVideoModalOpen(true);
                        setOpenedVideo(id);
                        setDefaultValues({
                          videoUrl: `https://www.youtube.com/watch?v=${videoLinkId}`,
                        });
                      }}
                    >
                      Add this video to your videos
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImportantChannelsAndVideos;
