import { Link, useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TopicType } from "@/hooks/useGetTopics";
import Modal from "@/components/Modal";
import Form from "@/components/Form";
import { Text, Youtube, Tv2 } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import Button from "@/components/Button";
import useGetTopicTexts from "@/hooks/useGetTopicTexts";
import useGetTopicVideos from "@/hooks/useGetTopicVideos";
import useGetTopicChannels from "@/hooks/useGetTopicChannels";
import useAddVideoHandler from "@/hooks/useAddVideoHandler";
import InfiniteScroll from "@/components/InfiniteScroll";
import ChannelCard from "@/components/ChannelCard";

const useGetTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const response = await axios.get(`topic/${topicId}`);
      return response.data as TopicType;
    },
  });
};

// useGetTranscript hook has been moved to useAddVideoHandler custom hook

const AdminTopic = () => {
  const { topicId } = useParams();
  const [channelUrl, setChannelUrl] = useState("");
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  const { data: topic, isLoading } = useGetTopic(topicId!);

  const topicType = topic?.type;

  const {
    texts,
    isFetchingNextPage: isTextsFetchingNextPage,
    hasNextPage: hasTextsNextPage,
    fetchNextPage: fetchNextTopicVideosPage,
  } = useGetTopicTexts(topicId as string, topicType === "texts");

  const {
    videos,
    isFetchingNextPage: isVideosFetchingNextPage,
    hasNextPage: hasVideosNextPage,
    fetchNextPage: fetchNextTopicTextsPage,
  } = useGetTopicVideos(
    topicId as string,
    topicType === "videos" || activeTab === "videos"
  );

  const {
    channels,
    isFetchingNextPage: isChannelsFetchingNextPage,
    hasNextPage: hasChannelsNextPage,
    fetchNextPage: fetchNextTopicChannelsPage,
  } = useGetTopicChannels(topicId as string, activeTab === "channels");

  // Using the custom hook for video handling
  const {
    youtubeUrl,
    setYoutubeUrl,
    isVideoDialogOpen,
    setIsVideoDialogOpen,
    getTranscript,
    addVideoHandler,
  } = useAddVideoHandler({ topic, lang: topic?.topicLanguage });

  console.log(topic);
  const addChannelHandler = async () => {
    try {
      await axios.post("/channel", {
        url: channelUrl,
        topicId: topic?._id,
      });
      setChannelUrl("");
      setIsChannelDialogOpen(false);
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{topic.title}</h1>
        {topic.language && (
          <p className="mt-1 text-sm text-gray-500">
            Language: {topic.language.toUpperCase()}
          </p>
        )}

        {topicType === "videos" ? (
          <Tabs
            defaultValue="videos"
            className="mt-4 w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="videos" className="flex gap-2 items-center">
                <Youtube className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex gap-2 items-center">
                <Tv2 className="w-4 h-4" />
                Channels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos">
              <Button
                onClick={() => setIsVideoDialogOpen(true)}
                className="mb-4"
              >
                Add Video
              </Button>
              <div className="mb-4">
                <Modal
                  isOpen={isVideoDialogOpen}
                  loading={getTranscript.isPending}
                  setIsOpen={setIsVideoDialogOpen}
                  className="w-full max-w-lg"
                >
                  <Modal.Header
                    setIsOpen={setIsVideoDialogOpen}
                    title="Add YouTube Video"
                  />
                  <Form className="p-0 space-y-6" onSubmit={addVideoHandler}>
                    <Form.FieldsContainer className="space-y-4">
                      <Form.Field>
                        <Form.Label>YouTube URL</Form.Label>
                        <Form.Input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter YouTube URL"
                          required
                        />
                      </Form.Field>
                    </Form.FieldsContainer>
                    <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => setIsVideoDialogOpen(false)}
                        size="parent"
                        type="button"
                        variant="danger"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="parent"
                        disabled={!youtubeUrl}
                      >
                        Get Transcript
                      </Button>
                    </Modal.Footer>
                  </Form>
                </Modal>
              </div>
              {videos?.length ? (
                <InfiniteScroll
                  fetchNextPage={fetchNextTopicTextsPage}
                  hasNextPage={hasVideosNextPage}
                  loadingElement={<p>loading...</p>}
                  className="grid grid-cols-1 gap-4"
                >
                  {videos?.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </InfiniteScroll>
              ) : (
                <p className="text-gray-500">No videos available</p>
              )}
            </TabsContent>

            <TabsContent value="channels">
              <Button
                onClick={() => setIsChannelDialogOpen(true)}
                className="mb-4"
              >
                Add Channel
              </Button>
              <div className="mb-4">
                <Modal
                  isOpen={isChannelDialogOpen}
                  setIsOpen={setIsChannelDialogOpen}
                  className="w-full max-w-lg"
                >
                  <Modal.Header
                    setIsOpen={setIsChannelDialogOpen}
                    title="Add Channel"
                  />
                  <Form className="p-0 space-y-6" onSubmit={addChannelHandler}>
                    <Form.FieldsContainer className="space-y-4">
                      <Form.Field>
                        <Form.Label>Channel URL</Form.Label>
                        <Form.Input
                          type="text"
                          value={channelUrl}
                          onChange={(e) => setChannelUrl(e.target.value)}
                          className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter Channel URL"
                          required
                        />
                      </Form.Field>
                    </Form.FieldsContainer>
                    <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => setIsChannelDialogOpen(false)}
                        size="parent"
                        type="button"
                        variant="danger"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="parent"
                        disabled={!channelUrl}
                      >
                        Add Channel
                      </Button>
                    </Modal.Footer>
                  </Form>
                </Modal>
              </div>
              {channels?.length ? (
                <InfiniteScroll
                  fetchNextPage={fetchNextTopicChannelsPage}
                  hasNextPage={hasChannelsNextPage}
                  loadingElement={<p>loading...</p>}
                  className="grid grid-cols-1 gap-4"
                >
                  {channels?.map((channel) => (
                    <ChannelCard key={channel._id} channel={channel} />
                  ))}
                </InfiniteScroll>
              ) : (
                <p className="text-gray-500">No channels available</p>
              )}
            </TabsContent>
          </Tabs>
        ) : topicType === "texts" ? (
          <>
            <Link to={"/texts/new"} state={{ topicId: topic._id }}>
              <Button className="mb-6">Add New Text</Button>
            </Link>{" "}
            <InfiniteScroll
              fetchNextPage={fetchNextTopicTextsPage}
              hasNextPage={hasTextsNextPage}
              className="grid grid-cols-1 gap-4"
            >
              {texts?.map((text) => (
                <Link to={"/texts/" + text._id} key={text._id}>
                  <div
                    id={text._id}
                    className="rounded-lg border  p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D]"
                  >
                    <div className="flex flex-1 gap-4 items-center">
                      <div
                        data-lov-name="div"
                        data-component-line="70"
                        className="p-3 bg-blue-100 *:w-6 *:h-6 text-primary rounded-lg dark:bg-indigo-900/30"
                      >
                        <Text />{" "}
                      </div>
                      <div>
                        <p className="flex-1 font-semibold">{text.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </InfiniteScroll>
          </>
        ) : (
          <p>lessons</p>
        )}
      </div>
    </div>
  );
};

export default AdminTopic;
