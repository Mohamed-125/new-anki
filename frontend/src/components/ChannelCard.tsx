import React from "react";
import { ChannelType } from "@/hooks/useGetTopicChannels";
import ActionsDropdown from "./ActionsDropdown";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface ChannelCardProps {
  channel: ChannelType;
  topicId: string;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, topicId }) => {
  const queryClient = useQueryClient();

  const deleteHandler = async () => {
    try {
      await axios.delete("/channel/" + channel._id);
      queryClient.invalidateQueries({ queryKey: ["topic-channels", topicId] });
      console.log("channel deleted!!!");
    } catch (err) {
      console.log("error deleting the channel", err);
    }
  };
  return (
    <div className="rounded-lg border p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D]">
      <div className="flex flex-1 gap-4 items-center">
        <Link
          to={`${channel._id}`}
          className="flex flex-1 gap-4 items-center max-w-full"
        >
          {channel.thumbnail ? (
            <div className="overflow-hidden w-12 h-12 rounded-full">
              <img
                src={channel.thumbnail}
                alt={channel.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full">
              <span className="text-lg font-bold text-gray-500">
                {channel.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold max-w-fit">{channel.name}</h3>
            {channel?.description && (
              <p className="text-sm text-gray-500 break-all line-clamp-2">
                {channel?.description}
              </p>
            )}
          </div>
        </Link>
        <div className="flex gap-4 items-center">
          <a
            href={channel.url}
            target="_blank"
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Channel
          </a>
          <ActionsDropdown itemId={channel._id} deleteHandler={deleteHandler} />
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
