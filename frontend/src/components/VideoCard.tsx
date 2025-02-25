import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Actions from "./ActionsDropdown";
import { twMerge } from "tailwind-merge";
import { useQueryClient } from "@tanstack/react-query";
import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";

type VideoCardProps = {
  video: {
    _id: string;
    thumbnail: string;
    title: string;
  };
  sideByside?: boolean;
};

const VideoCard = ({ video, sideByside }: VideoCardProps) => {
  const id = video._id;
  const { selectedItems, setSelectedItems } = useModalsStates();

  const isSelected = selectedItems?.includes(id);

  const queryClient = useQueryClient();

  const deleteHandler = (id: string) => {
    axios
      .delete(`video/${id}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["videos"] });
      })
      .catch((err) => err);
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
        to={"/video/" + video._id}
        className={twMerge(
          "overflow-hidden cursor-pointer h-full  rounded-t-xl",
          sideByside && "min-w-[40%]"
        )}
      >
        <img
          className={twMerge("w-full object-cover", sideByside && " h-full")}
          src={video.thumbnail}
        />
      </Link>

      <div className="flex justify-between gap-3 px-4 mt-4 grow">
        <Link to={"/video/" + video._id}>{video.title}</Link>
        <div>
          {!selectedItems?.length ? (
            <ActionsDropdown
              itemId={id as string}
              deleteHandler={deleteHandler}
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
