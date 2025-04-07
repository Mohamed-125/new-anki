import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TopicType } from "./useGetTopics";

type UseAddVideoHandlerProps = {
  topic?: TopicType;
  lang: string | undefined;
};

type TranscriptData = {
  translatedTranscript: string;
  transcript: string;
  title: string;
  thumbnail: string;
};

const useAddVideoHandler = ({ topic, lang }: UseAddVideoHandlerProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Extract the transcript fetching logic into a custom hook
  const getTranscript = useMutation({
    mutationFn: async ({ url, lang }: { url: string; lang?: string }) => {
      const response = await axios.post("transcript/get-transcript", {
        url,
        lang,
      });
      return response.data as TranscriptData;
    },
  });

  // The main handler function for adding a video
  const addVideoHandler = async () => {
    try {
      const data = await getTranscript.mutateAsync({
        url: youtubeUrl,
        lang,
      });
      const { translatedTranscript, transcript, title, thumbnail } = data;
      await axios.post("/video", {
        url: youtubeUrl,
        defaultCaptionData: {
          translatedTranscript,
          transcript,
        },
        topicId: topic?._id,
        title,
        thumbnail,
      });

      setYoutubeUrl("");
      setIsVideoDialogOpen(false);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  return {
    youtubeUrl,
    setYoutubeUrl,
    isVideoDialogOpen,
    setIsVideoDialogOpen,
    getTranscript,
    addVideoHandler,
  };
};

export default useAddVideoHandler;
