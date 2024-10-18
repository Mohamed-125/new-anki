import React, { useState } from "react";
import Actions from "./Actions";
import type { CardType } from "../hooks/useGetCards";

type CardProps = {
  setDefaultValues?: React.Dispatch<React.SetStateAction<any>>;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  id: string;
  setActionsDivId: React.Dispatch<React.SetStateAction<string>>;
  isActionDivOpen: boolean;
  selectedItems?: string[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  card: CardType;
  isSameUser: boolean;
};

const Card = ({
  setDefaultValues,
  setIsAddCardModalOpen,
  setContent,
  setEditId,
  id,
  setActionsDivId,
  isActionDivOpen,
  selectedItems,
  setSelectedItems,
  card,
  isSameUser,
}: CardProps) => {
  const isSelected = selectedItems?.includes(id);
  const { back, content, front } = card;

  return (
    <div
      className="flex items-center px-8 py-6 mb-4 bg-white border shadow-md cursor-pointer border-neutral-300 rounded-2xl"
      id={id}
    >
      <input
        checked={isSelected}
        type="checkbox"
        className="!min-w-6 !h-6 mr-4"
        onChange={(e) => {
          setSelectedItems?.((pre) => {
            if (e.target.checked) {
              return [...pre, id];
            } else {
              return [...pre.filter((item) => item !== id)];
            }
          });
        }}
      />{" "}
      <div className="grow">
        <p className="text-lg">{front}</p>
        <small className="text-base text-textGray">{back}</small>
      </div>
      {isSameUser ? (
        <Actions
          setDefaultValues={setDefaultValues}
          setContent={setContent}
          setIsModalOpen={setIsAddCardModalOpen}
          setEditId={setEditId}
          isSelected={isSelected}
          id={id}
          content={content}
          card={card}
          setActionsDivId={setActionsDivId}
          isActionDivOpen={isActionDivOpen}
        />
      ) : null}
    </div>
  );
};

export default Card;
