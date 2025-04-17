import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TopicType } from "./useGetTopics";

type UseAddVideoHandlerProps = {
  topicId?: string;
  videoLang?: string;
  channelId?: string;
};

type TranscriptData = {
  translatedTranscript: string;
  transcript: string;
  title: string;
  thumbnail: string;
};

const useAddVideoHandler = ({
  topicId,
  videoLang,
  channelId,
}: UseAddVideoHandlerProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Extract the transcript fetching logic into a custom hook
  const getTranscript = useMutation({
    mutationFn: async ({ url, lang }: { url: string; lang?: string }) => {
      const response = await axios.post("transcript/get-transcript", {
        url,
        lang: videoLang,
      });
      return response.data as TranscriptData;
    },
  });

  // The main handler function for adding a video
  const addVideoHandler = async () => {
    try {
      const data = await getTranscript.mutateAsync({
        url: youtubeUrl,
        lang: videoLang,
      });
      const { translatedTranscript, transcript, title, thumbnail } = data;
      await axios.post("/video", {
        url: youtubeUrl,
        defaultCaptionData: {
          translatedTranscript,
          transcript,
        },
        channelId,
        topicId,
        title,
        thumbnail,
      });

      setYoutubeUrl("");
      setIsVideoModalOpen(false);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  return {
    youtubeUrl,
    setYoutubeUrl,
    isVideoModalOpen,
    setIsVideoModalOpen,
    getTranscript,
    addVideoHandler,
  };
};

export default useAddVideoHandler;
