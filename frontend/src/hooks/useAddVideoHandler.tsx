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
  const [youtubeUrls, setYoutubeUrls] = useState("");
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

  // The main handler function for adding multiple videos
  const addVideoHandler = async () => {
    try {
      const urls = youtubeUrls.split("\n").filter((url) => url.trim());

      for (const url of urls) {
        const data = await getTranscript.mutateAsync({
          url: url.trim(),
          lang: videoLang,
        });

        const { translatedTranscript, transcript, title, thumbnail } = data;
        await axios.post("/video", {
          url: url.trim(),
          defaultCaptionData: {
            translatedTranscript,
            transcript,
          },
          channelId,
          topicId,
          title,
          thumbnail,
        });
      }

      setYoutubeUrls("");
      setIsVideoModalOpen(false);
    } catch (error) {
      console.error("Error processing videos:", error);
    }
  };

  return {
    youtubeUrls,
    setYoutubeUrls,
    isVideoModalOpen,
    setIsVideoModalOpen,
    getTranscript,
    addVideoHandler,
  };
};

export default useAddVideoHandler;
