import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Actions from "./ActionsDropdown";
import { twMerge } from "tailwind-merge";
import { useQueryClient } from "@tanstack/react-query";
import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";
import useToasts from "@/hooks/useToasts";

type VideoCardProps = {
  video: {
    _id: string;
    thumbnail: string;
    title: string;
  };
  sideByside?: boolean;
  moveVideoHandler?: any;
};

const VideoCard = ({ video, sideByside, moveVideoHandler }: VideoCardProps) => {
  const id = video._id;
  const { selectedItems, setSelectedItems } = useModalsStates();
  const { addToast } = useToasts();

  const isSelected = selectedItems?.includes(id);

  const queryClient = useQueryClient();

  const deleteHandler = () => {
    const toast = addToast("Deleting video...", "promise");
    axios
      .delete(`video/${id}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["videos"] });
        toast.setToastData({
          title: "Video deleted successfully!",
          type: "success",
          isCompleted: true,
        });
      })
      .catch(() => {
        toast.setToastData({ title: "Failed to delete video", type: "error" });
      });
  };

  return (
    <div
      id={id}
      className={twMerge(
        "bg-white flex flex-col rounded-xl items-center  border border-neutral-300 pb-3 mb-2 text-wrap",
        sideByside && "flex-row h-[180px] px-4 pb-0"
      )}
    >
      <Link
        to={"/videos/" + video._id}
        className={twMerge(
          "overflow-hidden cursor-pointer h-full  rounded-t-xl",
          sideByside && "min-w-[40%]"
        )}
      >
        <img
          className={twMerge(
            "w-full object-cover h-full",
            sideByside && " h-full"
          )}
          src={video.thumbnail}
        />
      </Link>

      <div className="flex gap-3 justify-between px-4 mt-4 grow">
        <Link to={video._id}>{video.title}</Link>
        <div>
          {!selectedItems?.length ? (
            <ActionsDropdown
              itemId={id as string}
              deleteHandler={deleteHandler}
              moveHandler={moveVideoHandler}
              setSelectedItems={setSelectedItems}
            />
          ) : (
            <SelectCheckBox
              id={id}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
