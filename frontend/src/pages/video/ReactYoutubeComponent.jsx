import AddCardModal from "../../components/AddCardModal";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import TranslationWindow from "./TranslationWindow";
import YouTube from "react-youtube"; // Assuming you have a YouTube player library
import useCreateNewCard from "../../hooks/useCreateNewCardMutation";
import { useQuery } from "@tanstack/react-query";
// import useCreateNewCardMutation from "../hooks/useCreateNewCardMutation";
// import { createCardHandler } from "../hooks/useCreateNewCardMutation";
import JoditEditor from "jodit-react";
import Card from "../../components/Card";
import useCardActions from "../../hooks/useCardActions";
import { FaPlay } from "react-icons/fa";
import Button from "../../components/Button";
import { MdVerticalAlignCenter } from "react-icons/md";

function ReactYoutubeComponent({
  onReady,
  playerRef,
  video,
  caption,
  subtitleContainerRef,
}) {
  const opts = {
    playerVars: {
      // Add other player parameters if needed
      autoplay: 0,
    },
  };
  const intervalId = useRef(null); // Ref to store interval ID
  const subtitleElements = useRef([]); // Ref to store subtitle elements
  useEffect(() => {
    return () => {
      // Clear interval on component unmount
      if (intervalId?.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  const onPlay = useCallback(
    (event) => {
      const subtitles = caption?.map((subtitle, index) => {
        subtitleElements.current[index] = document.querySelector(
          "#subtitle-" + index
        );
        return {
          offset: parseFloat(subtitle.offset.toFixed(1)),
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
              // const subtitleText = document.querySelector("#subtitle-" + i);
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

  const videoId = video?.url
    ?.replace("/watch?v=", "/embed/")
    .split("&")[0]
    .split("embed/")[1];

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
