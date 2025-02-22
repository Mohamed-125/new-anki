import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import useCardActions from "../hooks/useCardActions";
import Button from "./Button";
import { HiSwitchHorizontal } from "react-icons/hi";
import { CollectionType } from "../context/CollectionsContext";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuMoveUpRight } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CardProps = {
  setDefaultValues: React.Dispatch<React.SetStateAction<any>>;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  content?: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  setActionsDivId: React.Dispatch<React.SetStateAction<string>>;
  isActionDivOpen: boolean;
  playlistName?: string;
  isSelected?: boolean;
  card?: any;
  video?: any;
  selectedItems?: string[];
  note?: any;
  deleteHandler?: any;
  setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  navigateTo?: any;
  isSameUser: boolean;
  updateHandler?: any;
  collectionId?: string;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collection?: CollectionType;
  setIsAddCardModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Card = ({
  setDefaultValues,
  setContent,
  setEditId,
  id,
  selectedItems,
  setSelectedItems,
  card,
  isSameUser,
  setIsModalOpen,
  collection,
  playlistName,
  video,
  setIsMoveToCollectionOpen,
  note,
  navigateTo,
  collectionId,
}: CardProps) => {
  const isSelected = selectedItems?.includes(id);
  const { back, content, front } = card;

  const { updateCardHandler } = useCardActions();

  const switchHandler = () => {
    updateCardHandler(
      undefined,
      undefined,
      undefined,
      id,
      undefined,
      back,
      front
    );
  };

  return (
    <div
      className="flex items-center px-8 py-6 mb-4 max-w-full bg-white rounded-2xl border shadow-md cursor-pointer border-neutral-300"
      id={id}
    >
      <input
        checked={isSelected}
        type="checkbox"
        className="!min-w-5 !h-5 mr-2 sm:hidden"
        onChange={(e) => {
          setSelectedItems?.((pre) => {
            if (e.target.checked) {
              return [...pre, id];
            } else {
              return [...pre.filter((item) => item !== id)];
            }
          });
        }}
      />
      <div className="mr-3 text-2xl" onClick={switchHandler}>
        <HiSwitchHorizontal />
      </div>
      <div
        className="overflow-hidden whitespace-normal break-words grow text-ellipsis"
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
          setEditId(id);
        }}
      >
        <p className="text-lg sm:text-base">{front}</p>
        <small className="text-base text-gray-500 truncate">{back}</small>
      </div>
      {isSameUser && !isSelected ? (
        <>
          <DropdownMenuDemo
            setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
            collectionId={collectionId}
            id={id}
            setEditId={setEditId}
          />
        </>
      ) : null}
    </div>
  );
};

export default Card;

function DropdownMenuDemo({
  setIsMoveToCollectionOpen,
  collectionId,
  setEditId,
  id,
}: {
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collectionId: string | undefined;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  id: string;
}) {
  const deleteHandlerFunc = useCardActions().deleteHandler;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="text-2xl">
        <BsThreeDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-6 font-semibold">
        <Button
          onClick={() => {
            setIsMoveToCollectionOpen?.(true);
            setEditId(id);
          }}
          className={
            "flex gap-3 items-center leading-normal text-gray-700 bg-transparent border-none outline-none"
          }
        >
          <LuMoveUpRight className="text-xl" />
          Move
        </Button>
        <DropdownMenuSeparator />

        <Button
          className={
            "flex gap-3 items-center leading-normal text-red-600 bg-transparent border-none outline-none"
          }
          onClick={() => {
            deleteHandlerFunc(id, collectionId);
          }}
        >
          <FaTrashCan className="text-xl" />
          Delete
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
