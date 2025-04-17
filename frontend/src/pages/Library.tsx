import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Search from "../components/Search";
import useGetTopics, { TopicType } from "../hooks/useGetTopics";
import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../components/InfiniteScroll";
import TopicCard from "../components/TopicCard";
import TopicsSkeleton from "../components/TopicsSkeleton";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useGetTopicVideos from "@/hooks/useGetTopicVideos";
import useGetTopicTexts from "@/hooks/useGetTopicTexts";
import InfiniteScroll from "../components/InfiniteScroll";
import VideoSkeleton from "@/components/VideoSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import useGetTopicChannels from "@/hooks/useGetTopicChannels";

// Tab component for switching between content types
const ContentTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "lessons" | "lists";
  setActiveTab: React.Dispatch<React.SetStateAction<"lessons" | "lists">>;
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <Button
        onClick={() => setActiveTab("lessons")}
        variant={activeTab === "lessons" ? "primary" : "primary-outline"}
        className="px-6 py-2.5 font-medium rounded-lg transition-all"
      >
        Lessons
      </Button>
      <Button
        onClick={() => setActiveTab("lists")}
        variant={activeTab === "lists" ? "primary" : "primary-outline"}
        className="px-6 py-2.5 font-medium rounded-lg transition-all"
      >
        Lists
      </Button>
    </div>
  );
};

// Content card component for lessons and lists
const ContentCard = ({
  topic,
  item,
}: {
  topic: TopicType;
  item: LibraryItem;
}) => {
  return (
    <div className="max-w-[300px] min-w-[260px] flex-1 h-full flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px]">
      <Link
        to={`/${topic.type === "videos" ? "videos" : "texts"}/${item._id}`}
        className="block h-full"
      >
        <div className="relative h-[160px] overflow-hidden">
          <img
            src={
              item.image ||
              item.thumbnail ||
              "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg"
            }
            loading="lazy"
            alt={item.title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white bg-primary bg-opacity-90 rounded-md">
            {topic.type.substring(0, topic.type.length - 1)}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t to-transparent from-black/50"></div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-medium text-gray-800 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center mt-3"></div>
        </div>
      </Link>
    </div>
  );
};

// Section component with title, view all button, and horizontal slider
const LibrarySection = ({ topic }: { topic: TopicType }) => {
  const [activeTab, setActiveTab] = useState<"lessons" | "channels">("lessons");

  const {
    texts,
    fetchNextPage: fetchTextsNextPage,
    isFetchingNextPage: isTextsFetchingNextPage,
    hasNextPage: hasTextsNextPage,
  } = useGetTopicTexts(
    topic._id as string,
    topic.type === "texts" && activeTab === "lessons"
  );
  const {
    videos,
    fetchNextPage: fetchVideosNextPage,
    isFetchingNextPage: isVideosFetchingNextPage,
    hasNextPage: hasVideosNextPage,
  } = useGetTopicVideos(
    topic._id as string,
    topic.type === "videos" && activeTab === "lessons"
  );
  const {
    channels,
    fetchNextPage: fetchChannelsNextPage,
    hasNextPage: hasChannelsNextPage,
  } = useGetTopicChannels(topic._id as string, activeTab === "channels");

  const items = activeTab === "lessons" ? videos || texts : channels;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">{topic.title}</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "lessons"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "channels"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Channels
          </button>
        </div>
      </div>

      <InfiniteScroll
        fetchNextPage={
          activeTab === "lessons"
            ? texts
              ? fetchTextsNextPage
              : fetchVideosNextPage
            : fetchChannelsNextPage
        }
        hasNextPage={
          activeTab === "lessons"
            ? texts
              ? hasTextsNextPage
              : hasVideosNextPage
            : hasChannelsNextPage
        }
        loadingElement={
          <div className="flex gap-5 min-h-[230px] px-4 -mx-4 snap-x">
            {new Array(3).fill(0).map((_, i) => (
              <div
                key={i}
                className="min-w-[270px] items-center max-w-full bg-white border shadow-md cursor-pointer rounded-2xl border-neutral-300"
              >
                <Skeleton className="w-full h-[65%]" />
                <div className="flex flex-col h-[30%] overflow-hidden gap-2 px-8 py-4 whitespace-normal break-words grow text-ellipsis">
                  <Skeleton className="w-full h-5" />
                  <Skeleton className="w-[90%] h-5" />
                </div>
              </div>
            ))}
          </div>
        }
        className="flex overflow-x-auto gap-5 px-4 pb-4 -mx-4 h-full snap-x"
      >
        {items?.map((item: any) => (
          <div key={item._id} className="snap-start">
            {activeTab === "lessons" ? (
              <ContentCard topic={topic} item={item} />
            ) : (
              <div className="max-w-[300px] min-w-[260px] flex-1 h-full flex-shrink-0">
                <Link to={`/library/${item._id}`} className="block p-4 h-full">
                  <div className="flex flex-col gap-4 items-center">
                    {item.thumbnail ? (
                      <div className="overflow-hidden w-full h-full rounded-full border max-w-36">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-16 h-16 bg-gray-200 rounded-full">
                        <span className="text-xl font-bold text-gray-500">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-center text-gray-800">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

// Types for our custom data
type LibraryItem = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  thumbnail: string;
  type: "video" | "text";
  category: string;
};

const Library = () => {
  const [activeTab, setActiveTab] = useState<"lessons" | "lists">("lessons");

  // Search functionality
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const { selectedLearningLanguage } = useGetCurrentUser();
  // Fetch topics from backend
  const {
    topics,
    fetchNextPage,
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useGetTopics({
    query: debouncedQuery,
    topicLanguage: selectedLearningLanguage,
  });

  // For backward compatibility, still use the static data for the tabs
  return (
    <div className="container py-10">
      {/* Search bar for topics */}
      <Search searchingFor="topics" query={query} setQuery={setQuery} />
      {/* Tabs for switching between lessons and lists */}
      <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Display topics with infinite scroll */}
      <div className="mt-8">
        {isInitialLoading || !topics ? (
          <TopicsSkeleton />
        ) : (
          <>
            {topics.length ? (
              <InfiniteScroll
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                loadingElement={<TopicsSkeleton />}
              >
                <div>
                  {topics.map((topic) => {
                    return (
                      <LibrarySection
                        topic={topic}
                        //  activeTab={activeTab}
                      />
                    );
                  })}
                </div>{" "}
              </InfiniteScroll>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <p className="text-lg text-gray-500">No topics</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Library;
