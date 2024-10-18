import React, { useEffect, useId, useState } from "react";
import Button from "./Button";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import useCardActions from "../hooks/useCardActions";
import { CollectionType } from "../hooks/useGetCollections";

type ActionsProps = {
  setDefaultValues?: any;
  setEditId?: React.Dispatch<React.SetStateAction<string>>;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
  content?: string;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  setActionsDivId: React.Dispatch<React.SetStateAction<string>>;
  isActionDivOpen: boolean;
  playlistName?: string;
  isSelected?: boolean;
  card?: any;
  video?: any;
  note?: any;
  deleteHandler?: any;
  navigateTo?: any;
  updateHandler?: any;
  collection?: CollectionType;
};

const Actions = ({
  setDefaultValues,
  setContent,
  setEditId,
  content,
  setIsModalOpen,
  id,
  collection,
  setActionsDivId,
  isActionDivOpen,
  playlistName,
  isSelected,
  card,
  video,
  note,
  deleteHandler,
  navigateTo,
}: ActionsProps) => {
  const deleteHandlerFunc = deleteHandler || useCardActions().deleteHandler;

  return (
    <div className="relative ">
      {isActionDivOpen && (
        <div
          className={twMerge(
            " actions-div absolute  top-11 right-0  z-10  bg-gray-50 w-[200px] items-center   border-2 border-gray-200 shadow-md rounded-xl    text-xs px-3 py-6"
          )}
        >
          <Button
            variant={"primary-outline"}
            size="parent"
            className={"items-center flex gap-3 mb-3 leading-normal text-black"}
            onClick={() => {
              navigateTo?.();
              setDefaultValues({
                front: card?.front,
                back: card?.back,
                content: card?.content,
                collectionName: collection?.name,
                collectionPublic: collection?.public,
                playlistName,
                collectionId: card?.collectionId,
                playlistId: video?.playlistId || id,
                videoUrl: video?.url,
                defaultCaption: video?.defaultCaption,
                videoTitle: video?.title,
                videoThumbnail: video?.thumbnail,
                videoAvailableCaptions: video?.availableCaptions,
                videoDefaultCaption: video?.defaultCaption,
                videoId: video?._id,
                noteId: note?._id,
                noteContent: note?.content,
                noteTitle: note?.title,
              });

              setIsModalOpen?.(true);
              setContent?.(content ? content : "");
              setEditId?.(id);
            }}
          >
            <FaEdit className="text-3xl " /> Edit
          </Button>

          <Button
            variant={"danger-outline"}
            className={
              "w-full items-center leading-normal  flex gap-3  text-black"
            }
            onClick={() => {
              deleteHandlerFunc(id);
            }}
          >
            <FaTrashCan className="text-3xl " /> Delete
          </Button>
        </div>
      )}
      {!isSelected && (
        <Button
          variant={"primary-outline"}
          size="fit"
          className={"text-black "}
          onClick={() => {
            setActionsDivId((pre) => {
              if (pre === id) {
                return "";
              } else {
                return id;
              }
            });
          }}
        >
          ...
        </Button>
      )}
    </div>
  );
};

export default Actions;
