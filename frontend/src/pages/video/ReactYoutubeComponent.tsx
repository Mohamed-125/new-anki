import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import YouTube from "react-youtube"; // Assuming you have a YouTube player library
import { CaptionType } from "./Video";
import getYouTubeVideoId from "../../utils/getYoutubeVideoId";
import useActiveTranscriptLine from "@/hooks/useActiveTranscriptLine";

type Props = {
  playerRef: MutableRefObject<any>;
  onReady: (event: any) => void;
  caption: CaptionType[];
  video: any;
  subtitleContainerRef: MutableRefObject<HTMLDivElement | null>;
};

function ReactYoutubeComponent({ onReady, playerRef, video, caption }: Props) {
  const opts = {
    playerVars: {
      autoplay: 0,
      rel: 0,
    },
  };
  const intervalId = useRef(0); // Ref to store interval ID
  const subtitleElements = useRef<any[]>([]); // Ref to store subtitle elements
  useEffect(() => {
    return () => {
      // Clear interval on component unmount
      if (intervalId?.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);
  const [active, setActive] = useState(-1);

  useActiveTranscriptLine(
    playerRef,
    caption.map((c, i) => {
      return {
        ...c,
        offset: c.offset,
        trueEnd: caption[i + 1]?.offset ? caption[i + 1]?.offset : c.duration,
      };
    })
  );

  const onPlay = useCallback(
    (event: any) => {
      console.log("active", active);
      const subtitles = caption?.map((subtitle, index) => {
        const element = document.querySelector("#subtitle-" + index);
        if (element) {
          subtitleElements.current[index] = element;
        }

        return {
          offset: parseFloat((+subtitle.offset).toFixed(1)),
          duration: subtitle.duration * 1000,
        };
      });
      // Clear any existing interval
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }

      document
        .querySelector(`#subtitle-${active}`)
        ?.classList.add("subtitle-active");
    },
    [video, caption, active]
  ); // Add video as dependency if it can change

  useEffect(() => {
    return () => {
      if (intervalId.current) {
        cancelAnimationFrame(intervalId.current);
      }
    };
  }, []);

  const videoId = getYouTubeVideoId(video?.url);

  return (
    <YouTube
      className="aspect-video"
      videoId={videoId}
      opts={opts}
      onPlay={onPlay}
      onReady={onReady}
      playerRef={playerRef}
    />
  );
}

export default ReactYoutubeComponent;
