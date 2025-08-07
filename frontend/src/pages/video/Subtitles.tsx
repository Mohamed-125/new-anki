import axios from "axios";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";
import { Virtuoso } from "react-virtuoso";
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
import { VideoType } from "@/hooks/useGetVideos";
import useActiveTranscriptLine from "@/hooks/useActiveTranscriptLine";

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

  const { selectionData, setSelectionData } = useSelection();

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === video?.userId;

  const active = useActiveTranscriptLine(
    playerRef,
    caption.map((c, i) => {
      return {
        ...c,
        offset: c.offset,
        trueEnd: caption[i + 1]?.offset ? caption[i + 1]?.offset : c.duration,
      };
    })
  );

  const virtuosoRef = useRef<Virtuoso>(null);

  useEffect(() => {
    if (active >= 0 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: active, align: "center" });
    }
  }, [active]);

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
              selectionData={selectionData}
            />
            {/* 
            {caption.map((c, index) => {
              return (
                <Subtitle
                  selectionData={selectionData}
                  key={index}
                  n={index}
                  setDefaultValues={setDefaultValues}
                  selectedCaption={selectedCaption}
                  caption={c}
                  setIsAddCardModalOpen={setIsAddCardModalOpen}
                  video={video}
                  subtitle={caption[index]}
                  setEditId={setEditId}
                  playerRef={playerRef}
                  setSelectionData={setSelectionData}
                />
              );
            })} */}

            <Virtuoso
              data={caption}
              itemContent={(index, c) => (
                <Subtitle
                  selectionData={selectionData}
                  isActive={index === active}
                  key={index}
                  n={index}
                  setDefaultValues={setDefaultValues}
                  selectedCaption={selectedCaption}
                  caption={c}
                  setIsAddCardModalOpen={setIsAddCardModalOpen}
                  video={video}
                  subtitle={c}
                  setEditId={setEditId}
                  playerRef={playerRef}
                  setSelectionData={setSelectionData}
                />
              )}
            />
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
  video: VideoType;
  setDefaultValues: any;
  setIsAddCardModalOpen: any;
  isActive: any;
  setEditId: any;
  setSelectionData: React.Dispatch<React.SetStateAction<any>>;
};
const Subtitle = memo(function ({
  n,
  subtitle,
  playerRef,
  isActive,
  setEditId,
  video,
  setIsAddCardModalOpen,
  setDefaultValues,
  selectionData,
  setSelectionData,
}: SubtitleProps) {
  const [translatedText, setTranslatedText] = useState("");
  const { setIsTranslationBoxOpen } = useModalsStates();

  const { userCards } = useGetCards({ videoId: video._id });
  const words = subtitle.text.split(/\s+/);
  let modifiedText = words
    .map((word: string, index: number) => {
      const matchingCard = userCards?.find(
        (card) => {
          return card.front.trim() === word.trim();
        }
        // || card.back === word
      );

      if (matchingCard) {
        return `<span class="highlight" data-number="${index + 1}" data-id="${
          matchingCard._id
        }" data-text="${word}">${word}</span>`;
      }
      return `<span class="word" data-number="${
        index + 1
      }" data-text="${word}">${word}</span>`;
    })
    .join(" ");

  const onCardClick = (card: any) => {
    setDefaultValues({
      front: card.front,
      back: card.back,
      content: card?.content,
    });
    setEditId(card._id);
    setIsAddCardModalOpen(true);
  };

  const onWordClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "SPAN") return;

      if (target.classList.contains("highlight")) {
        const cardId = target.getAttribute("data-id");
        const card = userCards?.find((c) => c._id === cardId);
        if (card) onCardClick(card);
        return;
      }

      if (target.classList.contains("word")) {
        const word = target.getAttribute("data-text");
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNode(target.childNodes[0] as Node);
          selection.removeAllRanges();
          selection.addRange(range);

          if (word && word.trim().length >= 2) {
            setSelectionData({
              text: word,
              selection: selection,
            });
            setIsTranslationBoxOpen(true);
          } else {
            setSelectionData({ text: "", selection: null });
            setIsTranslationBoxOpen(false);
          }
        }
      }
    },
    [words, userCards, setSelectionData, setIsTranslationBoxOpen]
  );

  useEffect(() => {
    if (!selectionData.text) {
      setIsTranslationBoxOpen(false);
    }
  }, [selectionData]);

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
        className={`cursor-pointer select-text group subtitle-item ${
          isActive ? "subtitle-active" : ""
        }`}
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
                onClick={onWordClick}
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
