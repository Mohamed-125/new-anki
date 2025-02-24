import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import useCardActions from "../hooks/useCardActions";
import Button from "./Button";
import { HiSwitchHorizontal } from "react-icons/hi";
import { CollectionType } from "@/hooks/useGetCollections";
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
import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";

type CardProps = {
  setDefaultValues: React.Dispatch<React.SetStateAction<any>>;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  content?: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  playlistName?: string;
  isSelected?: boolean;
  card?: any;
  video?: any;
  note?: any;
  deleteHandler?: any;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
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
  card,
  isSameUser,
  setIsModalOpen,
  selectedItems,
  setSelectedItems,
  collection,
  playlistName,
  video,
  setIsMoveToCollectionOpen,
  note,
  navigateTo,
  collectionId,
}: CardProps) => {
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

  const deleteHandlerFunc = useCardActions().deleteHandler;

  const moveHandler = () => {
    setIsMoveToCollectionOpen?.(true);
    setEditId(id);
  };
  const deleteHandler = () => {
    deleteHandlerFunc(id, collectionId);
  };

  return (
    <div
      className="flex items-center px-8 py-6 mb-4 max-w-full bg-white hover:scale-[101%] duration-[400ms] rounded-2xl border shadow-md transition-all cursor-pointer hover:shadow-lg card border-neutral-300"
      id={id}
    >
      <div className="mr-3 text-2xl" onClick={switchHandler}>
        <HiSwitchHorizontal />
      </div>
      <div
        className="overflow-hidden break-words whitespace-normal grow text-ellipsis"
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
      {isSameUser && !selectedItems?.length ? (
        <>
          <ActionsDropdown
            setSelectedItems={setSelectedItems}
            itemId={id}
            moveHandler={moveHandler}
            deleteHandler={deleteHandler}
          />
        </>
      ) : (
        <SelectCheckBox
          id={id}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      )}
    </div>
  );
};

export default Card;
