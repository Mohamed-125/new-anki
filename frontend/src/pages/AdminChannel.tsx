import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetChannelVideos from "@/hooks/useGetChannelVideos";
import useGetChannel from "@/hooks/useGetChannel";
import InfiniteScroll from "@/components/InfiniteScroll";
import ActionsDropdown from "@/components/ActionsDropdown";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Button from "@/components/Button";
import AddVideoModal from "@/components/AddVideoModal";
import useAddVideoHandler from "@/hooks/useAddVideoHandler";
import useModalsStates from "@/hooks/useModalsStates";
import SelectedItemsController from "@/components/SelectedItemsController";
const AdminChannel = () => {
  const { channelId } = useParams();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string>();

  const { channel, isLoading: isLoadingChannel } = useGetChannel(
    channelId as string
  );
  const {
    videos,
    videosCount,
    fetchNextPage,
    hasNextPage,
    isInitialLoading,
    isFetchingNextPage,
  } = useGetChannelVideos(channelId as string, true);

  const { isVideoModalOpen, setIsVideoModalOpen } = useAddVideoHandler({
    channelId: channel?._id,
  });

  const { setSelectedItems } = useModalsStates();

  console.log("videos", videos);
  return (
    <div className="p-6 mx-auto max-w-7xl">
      {isLoadingChannel ? (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin" />
        </div>
      ) : channel ? (
        <div className="mb-8">
          <div className="flex gap-4 items-center mb-4">
            {channel.thumbnail && (
              <img
                src={channel.thumbnail}
                alt={channel.name}
                className="object-cover w-28 rounded-full border h-2w-28"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{channel.name}</h1>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Channel Videos</h2>
            <div className="text-gray-600">
              Total Videos: {videosCount || 0}
            </div>
          </div>
        </div>
      ) : null}

      <Button className="mb-6" onClick={() => setIsVideoModalOpen(true)}>
        Add video to this channel
      </Button>
      <AddVideoModal
        channelId={channelId}
        isVideoModalOpen={isVideoModalOpen}
        setIsVideoModalOpen={setIsVideoModalOpen}
      />
      <SelectedItemsController />
      <InfiniteScroll
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        className="grid grid-cols-3 gap-3 sm:grid-cols-1 lg:grid-cols-2"
        loadingElement={
          <div className="flex col-span-full justify-center py-4">
            <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin" />
          </div>
        }
      >
        {videos?.map((video) => (
          <div
            key={video._id}
            className="flex relative flex-col p-3 rounded-lg border border-gray-200 transition-all hover:shadow-md"
          >
            <div className="overflow-hidden mb-2 rounded-md aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
              {video.title}
            </h3>
            <div className="flex justify-between items-center mt-auto">
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={!!video.topicId}
                  onChange={async (e) => {
                    try {
                      await axios.patch(`video/${video._id}`, {
                        topicId: e.target.checked ? channel?.topicId : null,
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["channel-videos", channelId],
                      });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
                <span className="text-sm text-gray-600">
                  Add to channel topic
                </span>
              </div>
              <ActionsDropdown
                setSelectedItems={setSelectedItems}
                itemId={video._id}
                deleteHandler={async () => {
                  try {
                    await axios.delete(`video/${video._id}`);
                    queryClient.invalidateQueries({
                      queryKey: ["channel-videos", channelId],
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </InfiniteScroll>

      {isInitialLoading && (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 rounded-full border-b-2 border-gray-900 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AdminChannel;
