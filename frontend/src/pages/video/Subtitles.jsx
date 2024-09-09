import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";

import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";
import { Virtuoso } from "react-virtuoso";

function Subtitles({
  selectionData,
  video,
  playerRef,
  setCaption,
  handleSelection,
  caption,
  subtitleContainerRef,
}) {
  const [selectedCaption, setSelectedCaption] = useState("");

  const [isCaptionLoading, setIsCaptionLoading] = useState(true);

  const scrollToSubtitle = () => {
    const activeSubtitle = document.querySelector(".subtitle-active");
    activeSubtitle.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (video?.availableCaptions?.length) {
      axios
        .get(
          "/video/getTranscript?url=" +
            video.url +
            "&lang=" +
            video?.availableCaptions[video?.defaultCaption]
        )
        .then((res) => {
          setCaption(res.data.caption);
        })
        .finally(() => setIsCaptionLoading(false));
    }

    setSelectedCaption(video?.availableCaptions[video?.defaultCaption]);
  }, [video]);

  useEffect(() => {
    console.log("isCaptionLoading", isCaptionLoading);
  }, [isCaptionLoading]);

  const handleCaptionChange = (e) => {
    console.log("caption changed");
    setIsCaptionLoading(true);
    setSelectedCaption(e.target.value);

    axios
      .get(`/video/getTranscript?url=${video.url}&lang=${e.target.value}`)
      .then((res) => {
        setCaption(res.data.caption);
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => setIsCaptionLoading(false));
  };

  return (
    // Render your list

    <div
      ref={subtitleContainerRef}
      className="w-full  flex flex-col py-8 gap-8 h-[85vh] select-text  overflow-auto  bg-white rounded-r-md px-5 "
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
          {video?.availableCaptions?.map((caption) => (
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

        {caption.map((subtitle, _) => {
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
  );
}
export default Subtitles;

function Subtitle({
  n,
  subtitle,
  selectionData,
  playerRef,
  handleSelection,
  caption,
  video,
}) {
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
    const translateText = async (text) => {
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
        className="cursor-pointer select-text group"
        onMouseUp={selectionData.text ? () => {} : handleSelection}
        onClick={(e) => {
          if (playerRef?.current) {
            playerRef.current.seekTo(subtitle.offset);
          }
        }}
      >
        <div className=" py-4 border-t-2 border-gray-300 relative">
          <div className="flex items-center gap-2">
            <FaPlay className="invisible p-1 text-2xl text-gray-700 border border-gray-700 rounded-full group-hover:visible" />
            <p>{subtitle.text}</p>
          </div>
          <div className="flex items-center gap-2 ">
            {isTranslatedLoading ? (
              <Loading loaderClassName="absolute py-2 !w-10 !h-10" />
            ) : (
              <>
                <FaPlay className="invisible p-1 text-2xl text-gray-700 border border-gray-700 rounded-full " />
                <p className="text-gray-500 mt-2">{translatedText}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
