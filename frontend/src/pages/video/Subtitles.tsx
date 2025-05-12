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
import useModalsStates from "@/hooks/useModalsStates";
import TranslationWindow from "@/components/TranslationWindow";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

type subtitleProps = {
  video: any;
  playerRef: any;
  setCaption: React.Dispatch<React.SetStateAction<CaptionType[]>>;
  caption: CaptionType[];
  subtitleContainerRef: any;
};

const Subtitles = memo(function ({
  video,
  playerRef,
  setCaption,
  caption,
  subtitleContainerRef,
}: subtitleProps) {
  const [selectedCaption, setSelectedCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);

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

  const { setDefaultValues, setIsAddCardModalOpen, setContent, setEditId } =
    useModalsStates();

  const { selectionData } = useSelection();

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === video?.userId;

  return (
    // Render your list
    <div className="relative">
      <Button
        variant="primary"
        className="absolute text-2xl rounded-full top-[-10px] right-5 z-40"
        onClick={scrollToSubtitle}
      >
        <MdVerticalAlignCenter />
      </Button>
      <div className="flex gap-1   bg-white rounded-r-md  h-[85vh] overflow-hidden">
        <div
          id="captions-div"
          ref={subtitleContainerRef}
          className="flex overflow-auto flex-col px-3 w-full select-text grow"
        >
          <div className="relative select-text subtitles-div grow">
            {isCaptionLoading && <Loading />}
            <TranslationWindow
              setIsAddCardModalOpen={setIsAddCardModalOpen}
              setDefaultValues={setDefaultValues}
              setContent={setContent}
              isSameUser={isSameUser}
              selectionData={selectionData}
            />
            {caption?.map((subtitle: CaptionType, _) => {
              return (
                <Subtitle
                  selectionData={selectionData}
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
    </div>
  );
});
export default Subtitles;

type SubtitleProps = {
  n: number;
  subtitle: any;
  selectionData: any;
  playerRef: any;
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
      if (video.defaultCaptionData.name === selectedCaption) {
        setTranslatedText(video.defaultCaptionData.translatedTranscript[n]);
      }
    };
    translateText(subtitle);
  }, []);

  const { userCards } = useGetCards();
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
    <div
      onClick={(e) => {
        if (playerRef?.current) {
          playerRef.current.seekTo(subtitle.offset);
        }
      }}
      className={n == 0 ? "mt-7" : ""}
    >
      <div
        id={"subtitle-" + n}
        key={subtitle._id}
        className="cursor-pointer select-text group"
      >
        <div className="relative py-4 border-b-2 border-gray-200">
          <div
            className="relative subtitle w-fit"
            data-translated-text={translatedText}
          >
            <div className="flex gap-2 mb-3 select-text items center">
              <p
                className="pl-[30px]"
                dangerouslySetInnerHTML={{ __html: modifiedText }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.classList.contains("highlight")) {
                    const cardId = target.getAttribute("data-id");
                    const card = userCards?.find((c) => c._id === cardId);
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
