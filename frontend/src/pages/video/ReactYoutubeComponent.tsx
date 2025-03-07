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
      // Add other player parameters if needed
      autoplay: 0,
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

  const onPlay = useCallback(
    (event: any) => {
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

      const updateSubtitleHighlight = () => {
        if (playerRef.current) {
          const currentTime = parseFloat(
            playerRef.current.getCurrentTime().toFixed(1)
          );
          const index = subtitles.findIndex(
            (subtitle) => subtitle.offset === currentTime
          );

          subtitleElements?.current[index]?.classList.add("subtitle-active");
          if (index !== -1) {
            subtitleElements.current.forEach((subtitleText, i) => {
              if (i !== index) {
                subtitleText?.classList?.remove("subtitle-active");
              }
            });
          }
        }

        // Call this function again on the next animation frame
        intervalId.current = requestAnimationFrame(updateSubtitleHighlight);
      };

      // Start the animation loop
      intervalId.current = requestAnimationFrame(updateSubtitleHighlight);
    },
    [video, caption]
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
