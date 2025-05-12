import { useParams } from "react-router-dom";
import useGetList from "../hooks/useGetList";
import useGetListVideos from "../hooks/useGetListVideos";
import useGetListTexts from "../hooks/useGetListTexts";
import Button from "@/components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Clock, Video, Text, CheckCircle } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import SelectedItemsController from "@/components/SelectedItemsController";
import { useState } from "react";
import axios from "axios";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "@/hooks/useToasts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ListPage = () => {
  const { listId } = useParams();
  const { user } = useGetCurrentUser();
  const { list, isLoading: isListLoading } = useGetList(listId || "", !!listId);

  const {
    videos,
    videosCount,
    isInitialLoading: isVideosLoading,
    fetchNextPage: fetchNextVideos,
    hasNextPage: hasVideosNextPage,
    isFetchingNextPage: isVideosFetchingNextPage,
  } = useGetListVideos(listId || "", true);

  const {
    texts,
    textsCount,
    isInitialLoading: isTextsLoading,
    fetchNextPage: fetchNextTexts,
    hasNextPage: hasTextsNextPage,
    isFetchingNextPage: isTextsFetchingNextPage,
  } = useGetListTexts(listId || "", true);

  if (isListLoading || isVideosLoading || isTextsLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="w-1/3 h-8" />
          <Skeleton className="w-2/3 h-4" />
          <div className="flex gap-4 items-center">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[160px] w-full" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  const { addToast } = useToasts();
  if (!list || (!videos && !texts)) return null;

  const handleItemCompletion = async (itemId: string, itemType: string) => {
    const toast = addToast("Marking item as completed");
    try {
      await axios.post(`/list/${listId}/complete`, {
        itemId,
        itemType,
      });
      toast.setToastData({
        title: "Item marked as completed",
        type: "success",
      });
    } catch (error) {
      toast.setToastData({
        title: "Failed to mark item as completed",
        type: "error",
      });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <SelectedItemsController />
        <h1 className="text-3xl font-bold">{list.title}</h1>
        {list.description && (
          <p className="text-gray-600">{list.description}</p>
        )}
        <div className="flex gap-4 items-center text-sm text-gray-600">
          <div className="flex gap-2 items-center">
            <Video className="w-4 h-4" />
            <span>{list.videoCount} videos</span>
          </div>
          {list.totalDuration && (
            <div className="flex gap-2 items-center">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(list.totalDuration / 60)} min</span>
            </div>
          )}
        </div>

        {videos && videos.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <div key={video._id} className="relative group">
                  <div
                    className={`relative ${
                      list.completedVideos?.includes(video._id)
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    <VideoCard video={video} />
                    {list.completedVideos?.includes(video._id) && (
                      <div className="flex absolute inset-0 justify-center items-center rounded-lg bg-black/10">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasVideosNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextVideos()}
                  disabled={isVideosFetchingNextPage}
                >
                  {isVideosFetchingNextPage ? "Loading more..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}

        {texts && texts.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {texts.map((text) => (
                <div
                  key={text._id}
                  className={`relative p-6 bg-white rounded-lg shadow-sm transition-all group hover:shadow-md ${
                    list.completedTexts?.includes(text._id) ? "opacity-75" : ""
                  }`}
                >
                  <Link to={`/texts/${text._id}`} className="block">
                    <h3 className="mb-2 text-xl font-semibold">{text.title}</h3>
                    {text.description && (
                      <p className="text-gray-600 line-clamp-2">
                        {text.description}
                      </p>
                    )}
                  </Link>
                  {list.completedTexts?.includes(text._id) ? (
                    <div className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleItemCompletion(text._id, "text")}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {hasTextsNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextTexts()}
                  disabled={isTextsFetchingNextPage}
                >
                  {isTextsFetchingNextPage ? "Loading more..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;
