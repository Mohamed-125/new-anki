import { Link, useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TopicType } from "@/hooks/useGetTopics";
import { Text, Youtube, Tv2, List } from "lucide-react";
import useGetTopicLists from "@/hooks/useGetTopicLists";
import ListCard from "@/components/ListCard";
import AddListModal from "@/components/AddListModal";
import VideoCard from "@/components/VideoCard";
import Button from "@/components/Button";
import useGetTopicTexts from "@/hooks/useGetTopicTexts";
import useGetTopicVideos from "@/hooks/useGetTopicVideos";
import useGetTopicChannels from "@/hooks/useGetTopicChannels";
import useAddVideoHandler from "@/hooks/useAddVideoHandler";
import InfiniteScroll from "@/components/InfiniteScroll";
import ChannelCard from "@/components/ChannelCard";
import AddVideoModal from "@/components/AddVideoModal";
import AddChannelModal from "./AddChannelModal";
import SelectedItemsController from "@/components/SelectedItemsController";

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
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const { data: topic, isLoading } = useGetTopic(topicId!);

  const {
    lists,
    isFetchingNextPage: isListsFetchingNextPage,
    hasNextPage: hasListsNextPage,
    fetchNextPage: fetchNextTopicListsPage,
  } = useGetTopicLists(
    topicId as string,
    Boolean(activeTab === "lists" && topicId)
  );

  console.log("lists", lists);
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

  const { isVideoModalOpen, setIsVideoModalOpen } = useAddVideoHandler({
    topicId: topic?._id,
    videoLang: "de",
  });

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
              <TabsTrigger value="lists" className="flex gap-2 items-center">
                <List className="w-4 h-4" />
                Lists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos">
              <AddVideoModal
                topicId={topic._id}
                isVideoModalOpen={isVideoModalOpen}
                setIsVideoModalOpen={setIsVideoModalOpen}
              />
              <Button
                onClick={() => setIsVideoModalOpen(true)}
                className="mb-4"
              >
                Add Video
              </Button>
              <div className="mb-4"></div>
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
                onClick={() => setIsChannelModalOpen(true)}
                className="mb-4"
              >
                Add Channel
              </Button>
              <AddChannelModal
                topicId={topic._id}
                isChannelModalOpen={isChannelModalOpen}
                setIsChannelModalOpen={setIsChannelModalOpen}
              />
              {channels?.length ? (
                <InfiniteScroll
                  fetchNextPage={fetchNextTopicChannelsPage}
                  hasNextPage={hasChannelsNextPage}
                  loadingElement={<p>loading...</p>}
                  className="grid grid-cols-1 gap-4"
                >
                  {channels?.map((channel) => (
                    <ChannelCard
                      topicId={topic._id}
                      key={channel._id}
                      channel={channel}
                    />
                  ))}
                </InfiniteScroll>
              ) : (
                <p className="text-gray-500">No channels available</p>
              )}
            </TabsContent>

            <TabsContent value="lists">
              <SelectedItemsController isItemsLists={true} />
              <Button onClick={() => setIsListModalOpen(true)} className="mb-4">
                Add List
              </Button>
              <AddListModal
                topicId={topic._id}
                isListModalOpen={isListModalOpen}
                setIsListModalOpen={setIsListModalOpen}
              />
              {lists?.length ? (
                <InfiniteScroll
                  fetchNextPage={fetchNextTopicListsPage}
                  hasNextPage={hasListsNextPage}
                  loadingElement={<p>loading...</p>}
                  className="grid grid-cols-1 gap-4"
                >
                  {lists?.map((list) => (
                    <ListCard
                      setIsListModalOpen={setIsListModalOpen}
                      topicId={topicId as string}
                      key={list?._id}
                      list={list}
                    />
                  ))}
                </InfiniteScroll>
              ) : (
                <p className="text-gray-500">No lists available</p>
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
