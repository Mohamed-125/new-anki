import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Search from "../components/Search";
import useGetTopics, { TopicType } from "../hooks/useGetTopics";
import useDebounce from "../hooks/useDebounce";
import TopicsSkeleton from "../components/TopicsSkeleton";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import useGetTopicVideos from "@/hooks/useGetTopicVideos";
import useGetTopicTexts from "@/hooks/useGetTopicTexts";
import InfiniteScroll from "../components/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import useGetTopicChannels from "@/hooks/useGetTopicChannels";
import useGetTopicLists from "@/hooks/useGetTopicLists";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ActionsDropdown from "../components/ActionsDropdown";

const useGetUserLists = () => {
  const { selectedLearningLanguage } = useGetCurrentUser();

  const { data, isLoading, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
    {
      queryKey: ["userLists", selectedLearningLanguage],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await axios.get(
          `/list/user?page=${pageParam}&language=${selectedLearningLanguage} `
        );
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
    }
  );

  const userLists = useMemo(() => {
    return data?.pages.flatMap((page) => page.userLists);
  }, [data]);

  return {
    userLists,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  };
};

// Content card component for lessons and lists
const ContentCard = ({
  topic,
  item,
}: {
  topic: TopicType;
  item: LibraryItem;
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const originalSrc = target.src;

    if (retryCount < maxRetries && originalSrc !== "/placeholder.png") {
      setRetryCount((prev) => prev + 1);
      setTimeout(() => {
        target.src = originalSrc;
      }, retryDelay);
    } else if (target.src !== "/placeholder.png") {
      target.src = "/placeholder.png";
      setImageError(true);
      setRetryCount(0);
    }
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div className="max-w-[300px] min-w-[260px] flex-1 h-full flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px]">
      <Link
        to={`/${topic.type === "videos" ? "videos" : "texts"}/${item._id}`}
        className="block h-full"
      >
        <div className="relative h-[160px] overflow-hidden">
          {isImageLoading && (
            <div className="flex absolute inset-0 justify-center items-center bg-gray-100">
              <div className="w-8 h-8 rounded-full border-4 animate-spin border-primary border-t-transparent"></div>
            </div>
          )}
          <img
            src={item.image || item.thumbnail || "/placeholder.png"}
            loading="lazy"
            alt={item.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`object-cover w-full h-full transition-transform duration-500 hover:scale-105 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
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
          {imageError && (
            <p className="mt-1 text-xs text-gray-500">
              Image could not be loaded
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};
// Content skeleton for loading state
const ContentCardSkeleton = () => (
  <div className="min-w-[270px] max-w-[300px] flex-1 h-full flex-shrink-0 bg-white border shadow-md rounded-xl border-neutral-200 overflow-hidden">
    <div className="relative h-[160px]">
      <Skeleton className="w-full h-full rounded-none" />
      <div className="absolute top-3 right-3 z-10">
        <Skeleton className="w-16 h-6 rounded-md" />
      </div>
    </div>
    <div className="p-4 space-y-2">
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  </div>
);

// Channel card skeleton
const ChannelCardSkeleton = () => (
  <div className="max-w-[300px] relative py-4 min-w-[170px] flex-1 h-full flex-shrink-0">
    <div className="flex flex-col gap-4 items-center">
      <Skeleton className="w-36 h-36 rounded-full" />
      <Skeleton className="w-24 h-5" />
    </div>
  </div>
);

// Section component with title, view all button, and horizontal slider
const LibrarySection = ({ topic }: { topic: TopicType }) => {
  const [activeTab, setActiveTab] = useState<"lessons" | "channels" | "lists">(
    "lessons"
  );

  const {
    texts,
    fetchNextPage: fetchTextsNextPage,
    isFetchingNextPage: isTextsFetchingNextPage,
    hasNextPage: hasTextsNextPage,
    isLoading: isTextsLoading,
  } = useGetTopicTexts(
    topic._id as string,
    topic.type === "texts" && activeTab === "lessons"
  );
  const {
    videos,
    fetchNextPage: fetchVideosNextPage,
    isFetchingNextPage: isVideosFetchingNextPage,
    hasNextPage: hasVideosNextPage,
    isLoading: isVideosLoading,
  } = useGetTopicVideos(
    topic._id as string,
    topic.type === "videos" && activeTab === "lessons"
  );
  const {
    channels,
    fetchNextPage: fetchChannelsNextPage,
    hasNextPage: hasChannelsNextPage,
    isLoading: isChannelsLoading,
  } = useGetTopicChannels(topic._id as string, activeTab === "channels");

  const {
    lists,
    fetchNextPage: fetchListsNextPage,
    hasNextPage: hasListsNextPage,
    isLoading: isListsLoading,
  } = useGetTopicLists(topic._id as string, activeTab === "lists");

  const items =
    activeTab === "lessons"
      ? videos || texts
      : activeTab === "channels"
      ? channels
      : lists;

  const isLoading =
    activeTab === "lessons"
      ? topic.type === "videos"
        ? isVideosLoading
        : isTextsLoading
      : activeTab === "channels"
      ? isChannelsLoading
      : isListsLoading;

  const [retryCount, setRetryCount] = useState(0);

  const [isChannelImageLoading, setIsChannelImageLoading] = useState(true);
  const [channelImageError, setChannelImageError] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const originalSrc = target.src;

    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    if (retryCount < maxRetries && originalSrc !== "/placeholder.png") {
      setRetryCount((prev) => prev + 1);
      setTimeout(() => {
        target.src = originalSrc;
      }, retryDelay);
    } else if (target.src !== "/placeholder.png") {
      target.src = "/placeholder.png";
      setChannelImageError(true);
      setRetryCount(0);
    }
    setIsChannelImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsChannelImageLoading(false);
  };

  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">{topic.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 border border-gray-300  py-2 rounded-lg transition-all ${
              activeTab === "lessons"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-4  border border-gray-300 py-2 rounded-lg transition-all ${
              activeTab === "channels"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => setActiveTab("lists")}
            className={`px-4  border border-gray-300 py-2 rounded-lg transition-all ${
              activeTab === "lists"
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Lists
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-5 min-h-[230px] px-4 -mx-4 snap-x overflow-x-auto">
          {new Array(4)
            .fill(0)
            .map((_, i) =>
              activeTab === "channels" ? (
                <ChannelCardSkeleton key={i} />
              ) : (
                <ContentCardSkeleton key={i} />
              )
            )}
        </div>
      ) : items && items.length > 0 ? (
        <InfiniteScroll
          fetchNextPage={
            activeTab === "lessons"
              ? texts
                ? fetchTextsNextPage
                : fetchVideosNextPage
              : activeTab === "channels"
              ? fetchChannelsNextPage
              : fetchListsNextPage
          }
          hasNextPage={
            activeTab === "lessons"
              ? texts
                ? hasTextsNextPage
                : hasVideosNextPage
              : activeTab === "channels"
              ? hasChannelsNextPage
              : hasListsNextPage
          }
          loadingElement={
            <div className="flex gap-5 min-h-[230px] px-4 -mx-4 snap-x">
              {new Array(3)
                .fill(0)
                .map((_, i) =>
                  activeTab === "channels" ? (
                    <ChannelCardSkeleton key={i} />
                  ) : (
                    <ContentCardSkeleton key={i} />
                  )
                )}
            </div>
          }
          className="flex overflow-x-auto gap-5 px-4 pb-4 -mx-4 h-full"
        >
          {items.map((item: any) => (
            <div key={item._id} className="flex">
              {activeTab === "lessons" ? (
                <ContentCard topic={topic} item={item} />
              ) : activeTab === "channels" ? (
                <div className="max-w-[300px] relative py-4 min-w-[170px] flex-1 h-full flex-shrink-0">
                  <Link to={`/library/${item._id}`} className="">
                    <div className="flex flex-col gap-4 items-center">
                      {item.thumbnail ? (
                        <div className="overflow-hidden w-full h-full rounded-full border max-w-36">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            onError={handleImageError}
                            className="object-cover w-full h-full aspect-square"
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
                        <h5 className="font-medium text-center text-gray-800 text-md">
                          {item.name}
                        </h5>
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="max-w-[300px] min-w-[260px] flex-1 h-full flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px]">
                  <Link to={`/lists/${item._id}`} className="block h-full">
                    <div className="relative h-[160px] overflow-hidden">
                      <img
                        src={item.thumbnail || "/placeholder.png"}
                        loading="lazy"
                        alt={item.title}
                        className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white bg-primary bg-opacity-90 rounded-md">
                        list
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t to-transparent from-black/50"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-medium text-gray-800 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                      <div className="flex gap-2 items-center mt-2 text-sm text-gray-600">
                        <span>{item.videoCount} videos</span>
                        {item.totalDuration && (
                          <>
                            <span>•</span>
                            <span>
                              {Math.floor(item.totalDuration / 60)} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </InfiniteScroll>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
          <div className="p-6 mb-5 text-6xl bg-gray-100 rounded-full">
            {activeTab === "lessons"
              ? topic.type === "videos"
                ? "🎬"
                : "📚"
              : activeTab === "channels"
              ? "📺"
              : "📋"}
          </div>
          <h3 className="mb-2 text-xl font-medium text-gray-700">
            No{" "}
            {activeTab === "lessons"
              ? topic.type === "videos"
                ? "videos"
                : "texts"
              : activeTab}{" "}
            available
          </h3>
          <p className="mb-6 max-w-md text-center text-gray-500">
            {activeTab === "lessons"
              ? `There are no ${
                  topic.type === "videos" ? "videos" : "texts"
                } available for this topic yet.`
              : activeTab === "channels"
              ? "No channels have been created for this topic yet."
              : "No lists have been created for this topic yet."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary-outline"
              className="flex gap-2 items-center px-4 py-2 border-gray-300"
              onClick={() => {
                // Switch to another tab that might have content
                if (activeTab === "lessons") {
                  setActiveTab("channels");
                } else if (activeTab === "channels") {
                  setActiveTab("lists");
                } else {
                  setActiveTab("lessons");
                }
              }}
            >
              <span>
                {activeTab === "lessons"
                  ? "Try Channels"
                  : activeTab === "channels"
                  ? "Try Lists"
                  : "Try Lessons"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
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
  type: "video" | "text" | "list";
  category: string;
  videoCount?: number;
  totalDuration?: number;
};

const Library = () => {
  // Search functionality
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const { userLists, isLoading: isUserListsLoading } = useGetUserLists();

  console.log(userLists);
  const queryClient = useQueryClient();

  const removeFromCollection = async (listId: string) => {
    try {
      await axios.delete(`/list/user/${listId}/remove`);
      queryClient.invalidateQueries({ queryKey: ["userLists"] });
    } catch (error) {
      console.error("Error removing list from collection:", error);
      throw error;
    }
  };

  // Continue Learning Section
  const ContinueLearningSection = () => {
    if (isUserListsLoading) {
      return (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Continue Learning
          </h2>
          <div className="flex gap-5 min-h-[230px] px-4 -mx-4 snap-x overflow-x-auto">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
          </div>
        </div>
      );
    }

    if (!userLists?.length) return null;

    return (
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Continue Learning
        </h2>
        <div className="flex overflow-x-auto gap-5 px-4 pb-4 -mx-4">
          {userLists.map((item) => (
            <div key={item._id} className="flex relative group">
              <div className="max-w-[300px] min-w-[260px] flex-1 h-full flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px]">
                <div className="relative h-[160px] overflow-hidden">
                  <Link
                    to={`/lists/${item.listId?._id}`}
                    className="block h-full"
                  >
                    {" "}
                    <img
                      src={item.listId?.thumbnail || "/placeholder.png"}
                      loading="lazy"
                      alt={item.listId?.title}
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white bg-primary bg-opacity-90 rounded-md">
                    list
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t to-transparent from-black/50"></div>
                </div>
                <div className="p-4">
                  <Link to={`/lists/${item.listId?._id}`}>
                    <h3 className="text-base font-medium text-gray-800 line-clamp-2">
                      {item.listId?.title}
                    </h3>
                  </Link>
                  <div className="flex gap-2 items-center mt-2 text-sm text-gray-600">
                    <div className="overflow-hidden flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(item.progress)}%</span>
                    <ActionsDropdown
                      itemId={item.listId?._id}
                      deleteHandler={() =>
                        removeFromCollection(item.listId?._id)
                      }
                      isCard={true}
                      setSelectedItems={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      {/* Continue Learning section */}
      <ContinueLearningSection />
      {/* Display topics with infinite scroll */}
      <div className="mt-8">
        {isInitialLoading ? (
          <div className="space-y-16 animate-pulse">
            <TopicsSkeleton />
            <TopicsSkeleton />
          </div>
        ) : !topics ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 rounded-xl border border-gray-200 p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
            <div className="p-6 mb-5 text-6xl bg-gray-100 rounded-full">🔍</div>
            <h3 className="mb-2 text-xl font-medium text-gray-700">
              Unable to load topics
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-500">
              There was a problem loading topics. Please try again later.
            </p>
            <Button
              variant="primary"
              className="px-5 py-2.5 flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh Page</span>
            </Button>
          </div>
        ) : (
          <>
            {topics.length ? (
              <InfiniteScroll
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                loadingElement={
                  <div className="mt-8 animate-pulse">
                    <TopicsSkeleton />
                  </div>
                }
              >
                <div>
                  {topics.map((topic) => (
                    <LibrarySection key={topic._id} topic={topic} />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 rounded-xl border border-gray-200 p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
                <div className="p-6 mb-5 text-6xl bg-gray-100 rounded-full">
                  📚
                </div>
                <h3 className="mb-2 text-xl font-medium text-gray-700">
                  No topics found
                </h3>
                <p className="mb-6 max-w-md text-center text-gray-500">
                  {query
                    ? `No topics match your search "${query}". Try a different search term.`
                    : "There are no topics available for your selected language yet."}
                </p>
                {query && (
                  <Button
                    variant="primary-outline"
                    className="px-5 py-2.5 flex items-center gap-2 border-gray-300"
                    onClick={() => setQuery("")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                    <span>Clear Search</span>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Library;
