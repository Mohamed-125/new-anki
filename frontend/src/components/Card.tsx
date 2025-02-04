import React, { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import useCardActions from "../hooks/useCardActions";
import Button from "./Button";
import { HiSwitchHorizontal } from "react-icons/hi";
import { CollectionType } from "../context/CollectionsContext";

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
  const deleteHandlerFunc = useCardActions().deleteHandler;
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
      className="flex items-center px-8 py-6 mb-4 bg-white border shadow-md cursor-pointer border-neutral-300 rounded-2xl"
      id={id}
    >
      <input
        checked={isSelected}
        type="checkbox"
        className="!min-w-6 !h-6 mr-2"
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
      <div className="mr-3 text-3xl" onClick={switchHandler}>
        <HiSwitchHorizontal />
      </div>
      <div
        className="grow"
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
        <p className="text-lg">{front}</p>
        <small className="text-base text-textGray">{back}</small>
      </div>
      {isSameUser ? (
        <>
          <Button
            className={
              "items-center leading-normal  flex gap-3 outline-none  text-red-600 bg-transparent border-none"
            }
            onClick={() => {
              deleteHandlerFunc(id, collectionId);
            }}
          >
            <FaTrashCan className="text-3xl " />
          </Button>

          <Button
            onClick={() => {
              setIsMoveToCollectionOpen?.(true);
              setEditId(id);
            }}
            className={
              "items-center leading-normal  flex gap-3 outline-none  text-red-600 bg-transparent border-none"
            }
          >
            Move
          </Button>
        </>
      ) : null}
    </div>
  );
};

export default Card;
