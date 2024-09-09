import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Actions from "./Actions";

const Collection = ({
  collectionId,
  slug,
  name,
  setDefaultValues,
  setIsCollectionModalOpen,
  setEditId,
  id,
  updateHandler,
  deleteHandler,
  setActionsDivId,
  isActionDivOpen,
}) => {
  return (
    <div
      to={`/collections/${collectionId}`}
      state={{ id: collectionId }}
      className="px-4 py-5 bg-white border-2 flex items-center  border-gray-500 rounded-md shadow-lg cursor-pointer"
    >
      <Link className="grow">{name}</Link>
      <Actions
        setDefaultValues={setDefaultValues}
        setIsCollectionModalOpen={setIsCollectionModalOpen}
        setEditId={setEditId}
        id={id}
        collectionName={name}
        updateHandler={updateHandler}
        deleteHandler={deleteHandler}
        setActionsDivId={setActionsDivId}
        isActionDivOpen={isActionDivOpen}
      />
    </div>
  );
};

export default Collection;
