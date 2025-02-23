import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Actions from "./ActionsDropdown";
import { twMerge } from "tailwind-merge";
import { useQueryClient } from "@tanstack/react-query";

type VideoCardProps = {
  video: {
    _id: string;
    thumbnail: string;
    title: string;
  };
  setActionsDivId: React.Dispatch<React.SetStateAction<string>>;
  isActionDivOpen: boolean;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setIsVideoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  setDefaultValues: any;
  sideByside?: boolean;
};

const VideoCard = ({
  video,
  setActionsDivId,
  isActionDivOpen,
  sideByside,
  selectedItems,
  setSelectedItems,
  setIsVideoModalOpen,
  setDefaultValues,
}: VideoCardProps) => {
  const id = video._id;

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
      {sideByside && (
        <input
          checked={isSelected}
          type="checkbox"
          className="!min-w-6 !h-6 mr-4"
          onChange={(e) => {
            setSelectedItems((pre) => {
              if (e.target.checked) {
                return [...pre, id];
              } else {
                return [...pre.filter((item) => item !== id)];
              }
            });
          }}
        />
      )}

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

      <div className="flex gap-2 justify-between px-4 mt-4 grow">
        <Link to={"/video/" + video._id}>{video.title}</Link>
        <Actions
          id={video._id}
          deleteHandler={deleteHandler}
          video={video}
          setActionsDivId={setActionsDivId}
          setIsModalOpen={setIsVideoModalOpen}
          isActionDivOpen={isActionDivOpen}
          setDefaultValues={setDefaultValues}
        />
      </div>

      {!sideByside && (
        <input
          checked={isSelected}
          type="checkbox"
          className="!min-w-6 !h-6 mr-4 mt-2"
          onChange={(e) => {
            setSelectedItems((pre) => {
              if (e.target.checked) {
                return [...pre, id];
              } else {
                return [...pre.filter((item) => item !== id)];
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default VideoCard;
