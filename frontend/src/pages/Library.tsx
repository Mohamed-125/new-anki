import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Search from "../components/Search";
import useGetTopics, { TopicType } from "../hooks/useGetTopics";
import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import TopicCard from "../components/TopicCard";
import TopicsSkeleton from "../components/TopicsSkeleton";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

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
const ContentCard = ({ item }: { item: LibraryItem }) => {
  console.log(item.type);
  return (
    <div className="min-w-[280px] h-full flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px]">
      <Link
        to={`/${item.type === "video" ? "videos" : "texts"}/${item._id}`}
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
            {item.type}
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
const LibrarySection = ({
  title,
  items,
  type,
  activeTab,
}: {
  title: string;
  items: LibraryItem[];
  type: "video" | "text";
  activeTab: "lessons" | "lists";
}) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <Link
          to={`/${activeTab === "lessons" ? "texts" : "lists"}`}
          className="flex items-center font-medium text-primary hover:underline"
        >
          View all
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-5 px-4 pb-4 -mx-4">
        {items?.map((item) => (
          <div key={item._id} className="snap-start">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
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

  // Fetch topics from backend
  const {
    topics,
    fetchNextPage,
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useGetTopics({ query: debouncedQuery });

  // Implement infinite scroll
  useInfiniteScroll(fetchNextPage, hasNextPage);

  console.log(topics);

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
              <div>
                <div>
                  {topics.map((topic) => {
                    console.log(topic);

                    return (
                      <LibrarySection
                        title={topic.title}
                        items={topic.lessons as any[]}
                        type="text"
                        activeTab={activeTab}
                      />
                    );
                  })}
                </div>{" "}
                {isFetchingNextPage && <TopicsSkeleton />}
              </div>
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
