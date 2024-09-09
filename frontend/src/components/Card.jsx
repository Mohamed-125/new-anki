import React from "react";
import Actions from "./Actions";

const Card = ({
  front,
  back,
  examples,
  setDefaultValues,
  setIsAddCardModalOpen,
  setContent,
  setEditId,
  id,
  deleteHandler,
  setActionsDivId,
  isActionDivOpen,
}) => {
  return (
    <div className="bg-white px-8 py-7 mb-4 border border-gray-200 flex items-center shadow-md cursor-pointer rounded-2xl">
      <div className="grow">
        <p className="text-xl">{front}</p>
        <small className="text-lg text-gray-600">{back}</small>
      </div>
      <Actions
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setEditId={setEditId}
        examples={examples}
        id={id}
        deleteHandler={deleteHandler}
        front={front}
        back={back}
        setActionsDivId={setActionsDivId}
        isActionDivOpen={isActionDivOpen}
      />
    </div>
  );
};

export default Card;
