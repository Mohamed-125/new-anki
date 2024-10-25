import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";

import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";
import { Virtuoso } from "react-virtuoso";
import { CaptionType } from "./Video";
import getYouTubeVideoId from "../../utils/getYoutubeVideoId";
import AvailableCaptionsSelect from "../../components/AvailableCaptionsSelect";

type subtitleProps = {
  selectionData: { ele: any; text: string };
  video: any;
  playerRef: any;
  setCaption: React.Dispatch<React.SetStateAction<CaptionType[]>>;
  handleSelection: any;
  caption: CaptionType[];
  subtitleContainerRef: any;
};

function Subtitles({
  selectionData,
  video,
  playerRef,
  setCaption,
  handleSelection,
  caption,
  subtitleContainerRef,
}: subtitleProps) {
  const [selectedCaption, setSelectedCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(true);

  const scrollToSubtitle = () => {
    const activeSubtitle = document.querySelector(".subtitle-active");
    if (activeSubtitle) {
      activeSubtitle.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!video?.url) return;
    const videoId = getYouTubeVideoId(video.url);

    axios
      .get(
        "/video/getTranscript?videoId=" +
          videoId +
          "&lang=" +
          video?.defaultCaption
      )
      .then((res) => {
        setCaption(res.data);
      })
      .finally(() => setIsCaptionLoading(false));

    setSelectedCaption(video?.defaultCaption);
  }, [video]);

  const handleCaptionChange = (e: any) => {
    setIsCaptionLoading(true);
    setSelectedCaption(e.target.value);

    const videoId = getYouTubeVideoId(video.url);

    axios
      .get(
        `/video/getTranscript?videoId=${videoId}&lang=${e.target.value.trim()}`
      )
      .then((res) => {
        setCaption(res.data);
      })
      .catch((err) => {})
      .finally(() => setIsCaptionLoading(false));
  };

  return (
    // Render your list

    <div className="flex gap-1 py-8 bg-white rounded-r-md  h-[85vh] overflow-hidden">
      <div
        ref={subtitleContainerRef}
        className="flex flex-col w-full px-3 overflow-auto select-text grow"
      >
        <div>
          <label className="block mb-2 text-xl text-black">
            available captions
          </label>
          <AvailableCaptionsSelect
            availableCaptions={video?.availableCaptions}
            value={selectedCaption}
            setValue={setSelectedCaption}
          />
        </div>
        <div className="grow">
          <Button
            variant="primary"
            className="absolute text-2xl rounded-full top-[130px] right-4 z-50"
            onClick={scrollToSubtitle}
          >
            <MdVerticalAlignCenter />
          </Button>
          {isCaptionLoading && <Loading />}

          {caption?.map((subtitle: CaptionType, _) => {
            return (
              <Subtitle
                key={_}
                n={_}
                caption={caption}
                video={video}
                handleSelection={handleSelection}
                subtitle={subtitle}
                selectionData={selectionData}
                playerRef={playerRef}
              />
            );
          })}

          {/* <Virtuoso
          style={{ height: "100%" }}
          data={caption}
          itemContent={(_, subtitle) => {
            return (
              <Subtitle
                key={_}
                n={_}
                caption={caption}
                video={video}
                handleSelection={handleSelection}
                subtitle={subtitle}
                selectionData={selectionData}
                playerRef={playerRef}
              />
            );
          }}
        /> */}
        </div>
      </div>
    </div>
  );
}
export default Subtitles;

type SubtitleProps = {
  n: number;
  subtitle: any;
  selectionData: any;
  playerRef: any;
  handleSelection: any;
  caption: any;
  video: any;
};
function Subtitle({
  n,
  subtitle,
  selectionData,
  playerRef,
  handleSelection,
}: SubtitleProps) {
  // const [isTranslationLoading, setIsTranslationLoading] = useState(true);
  const [translatedText, setTranslatedText] = useState("");

  // useEffect(() => {
  //   caption.forEach((caption, index) => {
  //     if (caption.includes(video.videoCards)) {
  //       setSelectedIndex({ start: index, end: index });
  //     }
  //   });
  // }, [video])

  useEffect(() => {
    const translateText = async (text: string) => {
      const { data: translatedText } = await axios.post("/translate", {
        text,
      });

      setTranslatedText(translatedText);
      return translatedText;
    };
    translateText(subtitle.text);
  }, []);

  return (
    <div>
      <div
        id={"subtitle-" + n}
        key={subtitle._id}
        className="mt-2 cursor-pointer select-text group"
        onMouseUp={selectionData.text ? () => {} : handleSelection}
        onClick={(e) => {
          if (playerRef?.current) {
            playerRef.current.seekTo(subtitle.start);
          }
        }}
      >
        <div className="relative py-4 border-b-2 border-gray-200">
          <div
            className="relative subtitle "
            data-translated-text={translatedText}
          >
            <div className="flex gap-2 mb-3 items center">
              <FaPlay
                className={`invisible p-1 text-2xl text-gray-700   rounded-full group-hover:visible  `}
              />
              <p>{subtitle.text}</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-2 ">
            {isTranslatedLoading ? (
              <Loading loaderClassName="absolute py-2 !w-10 !h-10" />
            ) : (
              <div className="select-none">
                <FaPlay className="invisible p-1 text-2xl text-gray-700 border border-gray-700 rounded-full " />
                <p className="mt-2 text-gray-500 select-none">
                  {translatedText}
                </p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
