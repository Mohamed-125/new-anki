import React, { useId, useState } from "react";
import Button from "./Button";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

const Actions = ({
  deleteHandler,
  setDefaultValues,
  setContent,
  setIsAddCardModalOpen,
  setEditId,
  front,
  examples,
  back,
  setIsCollectionModalOpen,
  id,
  collectionName,
  isVideo = false,
  setActionsDivId,
  isActionDivOpen,
}) => {
  return (
    <div className="relative">
      {isActionDivOpen && (
        <div
          className={twMerge(
            " actions-div absolute top-11 right-0 z-50 bg-gray-50 w-[200px] items-center   border-2 border-gray-200 shadow-md rounded-xl    text-xs px-3 py-6"
          )}
        >
          {!isVideo && (
            <Button
              variant={"primary-outline"}
              className={"w-full items-center flex gap-3 mb-3  text-black"}
              onClick={() => {
                setDefaultValues?.({ front, back, collectionName });
                setIsAddCardModalOpen?.(true);

                setContent?.(examples);
                setIsCollectionModalOpen?.(true);
                setEditId?.(id);
              }}
            >
              <FaEdit className="text-3xl   " /> Edit
            </Button>
          )}

          <Button
            variant={"danger-outline"}
            className={"w-full items-center flex gap-3  text-black"}
            onClick={() => {
              deleteHandler(id);
            }}
          >
            <FaTrashCan className="text-3xl  " /> Delete
          </Button>
        </div>
      )}
      <Button
        variant={"outline-primary"}
        className={"text-black"}
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
    </div>
  );
};

export default Actions;
