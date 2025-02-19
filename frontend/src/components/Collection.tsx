import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Actions from "./Actions";
import { CollectionType } from "../hooks/useGetCollections";

type CollectionProps = {
  collection: CollectionType;
  setDefaultValues: any;
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  deleteHandler: any;
  setActionsDivId: React.Dispatch<React.SetStateAction<string>>;
  isActionDivOpen: boolean;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  selectedItems: string[];
  defaultValues?: any;
};

const Collection = ({
  collection,
  setDefaultValues,
  setIsCollectionModalOpen,
  setEditId,
  deleteHandler,
  setActionsDivId,
  isActionDivOpen,
  setSelectedItems,
  selectedItems,
}: CollectionProps) => {
  const id = collection._id;
  const isSelected = selectedItems.includes(id);
  const location = useLocation(); // Get the current path

  return (
    <div
      id={id}
      className="flex items-center gap-2 px-4 py-5 bg-white border shadow-lg rounded-xl border-neutral-300"
    >
      <input
        checked={isSelected}
        type="checkbox"
        className="!min-w-6 !h-6"
        onChange={(e) => {
          setSelectedItems((pre) => {
            if (e.target.checked) {
              return [...pre, id];
            } else {
              return [...pre.filter((item) => item !== id)];
            }
          });
        }}
      />{" "}
      <Link className="grow" to={`${location.pathname}/${id}`}>
        {collection.name}
      </Link>
      <Actions
        setDefaultValues={setDefaultValues}
        setIsModalOpen={setIsCollectionModalOpen}
        setEditId={setEditId}
        id={id}
        collection={collection}
        deleteHandler={deleteHandler}
        setActionsDivId={setActionsDivId}
        isActionDivOpen={isActionDivOpen}
        isSelected={isSelected}
      />
    </div>
  );
};

export default Collection;
