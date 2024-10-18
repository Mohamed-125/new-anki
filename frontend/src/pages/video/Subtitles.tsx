import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";

import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";
import { Virtuoso } from "react-virtuoso";
import { CaptionType } from "./Video";

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
  const [allText, setAllText] = useState([]);

  const scrollToSubtitle = () => {
    const activeSubtitle = document.querySelector(".subtitle-active");
    if (activeSubtitle) {
      activeSubtitle.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    video;
    if (video?.availableCaptions.length) {
      ("getting the transcript");
      axios
        .get(
          "/video/getTranscript?url=" +
            video.url +
            "&lang=" +
            video?.defaultCaption
        )
        .then((res) => {
          "res.data.caption", res.data.caption;

          setCaption(res.data.caption);
        })
        .finally(() => setIsCaptionLoading(false));
    }

    setSelectedCaption(video?.defaultCaption);
  }, [video]);

  useEffect(() => {
    "isCaptionLoading", isCaptionLoading;
  }, [isCaptionLoading]);

  const handleCaptionChange = (e: any) => {
    ("caption changed");
    setIsCaptionLoading(true);
    setSelectedCaption(e.target.value);

    axios
      .get(
        `/video/getTranscript?url=${video.url}&lang=${e.target.value.trim()}`
      )
      .then((res) => {
        setCaption(res.data.caption);
      })
      .catch((err) => {
        "err", err;
      })
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
          <select
            onChange={handleCaptionChange}
            value={selectedCaption}
            className="w-full px-3 py-3 border border-gray-300 rounded-md "
          >
            {video?.availableCaptions?.map((caption: any) => (
              <option key={caption} value={caption}>
                {caption}
              </option>
            ))}
          </select>
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

          {caption.map((subtitle: CaptionType, _) => {
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
  caption,
  video,
}: SubtitleProps) {
  const [selectedIndex, setSelectedIndex] = useState({ start: 0, end: 0 });
  // const [isTranslationLoading, setIsTranslationLoading] = useState(true);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslatedLoading, setIsTranslatedLoading] = useState(true);

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
    setIsTranslatedLoading(false);
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
            playerRef.current.seekTo(subtitle.offset);
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
