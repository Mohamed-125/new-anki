import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { ListType } from "@/hooks/useGetTopicLists";
import { Text, Video } from "lucide-react";
import Button from "@/components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfiniteScroll from "@/components/InfiniteScroll";
import useToasts from "@/hooks/useToasts";
import useGetListVideos from "@/hooks/useGetListVideos";
import useGetListTexts from "@/hooks/useGetListTexts";
import VideoCard from "@/components/VideoCard";
import AddVideoModal from "../components/AddVideoModal";
import useAddVideoHandler from "@/hooks/useAddVideoHandler";
import SelectedItemsController from "@/components/SelectedItemsController";

const useGetList = (listId: string) => {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: async () => {
      const response = await axios.get(`/list/${listId}`);
      return response.data as ListType;
    },
  });
};

const AdminList = () => {
  const { listId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("videos");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { data: list, isLoading } = useGetList(listId!);

  const { addToast } = useToasts();

  const {
    videos,
    isFetchingNextPage: isVideosFetchingNextPage,
    hasNextPage: hasVideosNextPage,
    fetchNextPage: fetchNextListVideosPage,
  } = useGetListVideos(listId as string, activeTab === "videos");

  const {
    texts,
    isFetchingNextPage: isTextsFetchingNextPage,
    hasNextPage: hasTextsNextPage,
    fetchNextPage: fetchNextListTextsPage,
  } = useGetListTexts(listId as string, activeTab === "texts");

  const {
    isVideoModalOpen: isAddVideoModalOpen,
    setIsVideoModalOpen: setIsAddVideoModalOpen,
  } = useAddVideoHandler({});

  const { mutate: addItem } = useMutation({
    mutationFn: async ({
      itemId,
      itemType,
    }: {
      itemId: string;
      itemType: string;
    }) => {
      const response = await axios.post(`/list/${listId}/items`, {
        itemId,
        itemType,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      addToast("Item added to list", "success");
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || "Failed to add item", "error");
    },
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await axios.delete(`/list/${listId}/items/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      addToast("Item removed from list", "success");
    },
    onError: (error: any) => {
      addToast(
        error.response?.data?.message || "Failed to remove item",
        "error"
      );
    },
  });

  if (isLoading || !list) return <div>Loading...</div>;

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{list.title}</h1>
        {list.description && (
          <p className="mb-4 text-gray-500">{list.description}</p>
        )}
        {list.tags && list.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {list.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Tabs
          defaultValue="videos"
          className="mt-4 w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="videos" className="flex gap-2 items-center">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="texts" className="flex gap-2 items-center">
              <Text className="w-4 h-4" />
              Texts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <AddVideoModal
              listId={listId}
              isVideoModalOpen={isAddVideoModalOpen}
              setIsVideoModalOpen={setIsAddVideoModalOpen}
            />
            <SelectedItemsController isItemsVideos={true} />
            <Button
              onClick={() => setIsAddVideoModalOpen(true)}
              className="mb-4"
            >
              Add Video
            </Button>
            {videos?.length ? (
              <InfiniteScroll
                fetchNextPage={fetchNextListVideosPage}
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

          <TabsContent value="texts">
            <Link to={"/texts/new"} state={{ listId: list._id }}>
              <Button className="mb-4">Add New Text</Button>
            </Link>
            {texts?.length ? (
              <InfiniteScroll
                fetchNextPage={fetchNextListTextsPage}
                hasNextPage={hasTextsNextPage}
                loadingElement={<p>loading...</p>}
                className="grid grid-cols-1 gap-4"
              >
                {texts?.map((text) => (
                  <Link to={"/texts/" + text._id} key={text._id}>
                    <div className="rounded-lg border p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D]">
                      <div className="flex flex-1 gap-4 items-center">
                        <div className="p-3 bg-blue-100 *:w-6 *:h-6 text-primary rounded-lg dark:bg-indigo-900/30">
                          <Text />
                        </div>
                        <div>
                          <p className="flex-1 font-semibold">{text.title}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </InfiniteScroll>
            ) : (
              <p className="text-gray-500">No texts available</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminList;
