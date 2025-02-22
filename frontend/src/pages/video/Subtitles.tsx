import axios from "axios";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";

import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";
import { CaptionType } from "./Video";
import getYouTubeVideoId from "../../utils/getYoutubeVideoId";
import AvailableCaptionsSelect from "../../components/AvailableCaptionsSelect";
import useGetCards from "../../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";

type subtitleProps = {
  video: any;
  playerRef: any;
  setCaption: React.Dispatch<React.SetStateAction<CaptionType[]>>;
  caption: CaptionType[];
  subtitleContainerRef: any;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setDefaultValues: any;
  setIsAddCardModalOpen: any;
  setEditId: any;
  isAddCardModalOpen: boolean;
};

const Subtitles = memo(function ({
  video,
  playerRef,
  setCaption,
  caption,
  subtitleContainerRef,
  setEditId,
  setDefaultValues,
  setIsAddCardModalOpen,
  isAddCardModalOpen,
  setContent,
}: subtitleProps) {
  const [selectedCaption, setSelectedCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);

  const {} = useSelection({
    isAddCardModalOpen,
    setContent,
    setDefaultValues,
    setIsAddCardModalOpen,
  });

  const scrollToSubtitle = () => {
    const activeSubtitle = document.querySelector(".subtitle-active");
    if (activeSubtitle) {
      activeSubtitle.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!video?.url) return;
    setSelectedCaption(video?.defaultCaptionData.name);
  }, [video]);

  useEffect(() => {
    console.log(caption);
  }, [caption]);
  return (
    // Render your list

    <div className="flex relative gap-1 py-8 bg-white rounded-r-md  h-[85vh] overflow-hidden">
      <div
        ref={subtitleContainerRef}
        className="flex flex-col w-full px-3 overflow-auto select-text grow"
      >
        <div>
          <label className="block mb-2 text-xl text-black">
            available captions
          </label>
          <AvailableCaptionsSelect
            setCaption={setCaption}
            setIsCaptionLoading={setIsCaptionLoading}
            setSelectedCaption={setSelectedCaption}
            video={video}
            availableCaptions={video?.availableCaptions}
            value={selectedCaption}
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
                setDefaultValues={setDefaultValues}
                selectedCaption={selectedCaption}
                caption={caption}
                setIsAddCardModalOpen={setIsAddCardModalOpen}
                video={video}
                subtitle={subtitle}
                setEditId={setEditId}
                playerRef={playerRef}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
export default Subtitles;

type SubtitleProps = {
  n: number;
  subtitle: any;
  selectionData: any;
  playerRef: any;
  handleSelection: any;
  caption: any;
  video: any;
  setDefaultValues: any;
  setIsAddCardModalOpen: any;
  selectedCaption: any;
  setEditId: any;
};
const Subtitle = memo(function ({
  n,
  subtitle,
  playerRef,
  selectedCaption,
  setEditId,
  video,
  setIsAddCardModalOpen,
  setDefaultValues,
}: SubtitleProps) {
  const [translatedText, setTranslatedText] = useState("");

  useEffect(() => {
    const translateText = async (text: string) => {
      console.log(
        video.defaultCaptionData.name === selectedCaption,
        video.defaultCaptionData.name,
        selectedCaption
      );
      if (video.defaultCaptionData.name === selectedCaption) {
        setTranslatedText(video.defaultCaptionData.translatedTranscript[n]);
      }
    };
    translateText(subtitle);
  }, []);

  useEffect(() => {
    console.log(translatedText);
  }, [translatedText]);

  const { data: userCards } = useGetCards();
  let modifiedText = subtitle.text;

  userCards?.forEach((card) => {
    const regex = new RegExp(`\\b(${card.front})\\b`, "gi"); // Use \b for word boundaries
    modifiedText = modifiedText.replace(
      regex,
      `<span class="highlight"  data-id=${card._id}>$1</span>` // Use "class" for raw HTML
    );
  });

  const onCardClick = (card: any) => {
    setDefaultValues({
      front: card.front,
      back: card.back,
      content: card?.content,
    });
    setEditId(card._id);
    setIsAddCardModalOpen(true);
  };

  return (
    <div>
      <div
        id={"subtitle-" + n}
        key={subtitle._id}
        className="mt-2 cursor-pointer select-text group"
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
              <p
                dangerouslySetInnerHTML={{ __html: modifiedText }}
                onClick={(e) => {
                  const target = e.target;
                  if (target.classList.contains("highlight")) {
                    const cardId = target.getAttribute("data-id");
                    const card = userCards.find((c) => c._id === cardId);
                    if (card) onCardClick(card);
                  }
                }}
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
