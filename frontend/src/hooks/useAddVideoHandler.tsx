import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TopicType } from "./useGetTopics";

type UseAddVideoHandlerProps = {
  topicId?: string;
  videoLang?: string;
  channelId?: string;
  listId?: string;
  setIsVideoModalOpen: any;
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
  listId,
  setIsVideoModalOpen,
}: UseAddVideoHandlerProps) => {
  const [youtubeUrls, setYoutubeUrls] = useState("");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // The main handler function for adding multiple videos
  const addVideoHandler = async () => {
    try {
      const urls = youtubeUrls.split("\n").filter((url) => url.trim());
      setIsLoading(true);
      for (const url of urls) {
        await axios.post("/video", {
          url: url.trim(),
          channelId,
          topicId,
          listId,
          videoLang: videoLang,
        });
      }
      setIsLoading(false);
      setYoutubeUrls("");
      setIsVideoModalOpen(false);
      if (topicId)
        queryClient.invalidateQueries({ queryKey: ["topics", topicId] });
      if (listId)
        queryClient.invalidateQueries({ queryKey: ["lists", listId] });
      if (channelId)
        queryClient.invalidateQueries({ queryKey: ["channels", channelId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    } catch (error) {
      setIsLoading(false);
      console.error("Error processing videos:", error);
    }
  };
  return {
    youtubeUrls,
    setYoutubeUrls,
    addVideoHandler,
    isLoading,
  };
};
export default useAddVideoHandler;
