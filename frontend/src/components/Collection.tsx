import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CollectionType } from "@/hooks/useGetCollections";

import { useQueryClient } from "@tanstack/react-query";
import { Folder } from "lucide-react";
import axios from "axios";
import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";
import useInvalidateCollectionsQueries from "@/hooks/Queries/useInvalidateCollectionsQuery";
import ItemCard from "./ui/ItemCard";

type CollectionProps = {
  collection: CollectionType;
};

const Collection = ({ collection }: CollectionProps) => {
  const id = collection._id;

  const {
    setEditId,
    setDefaultValues,
    setIsCollectionModalOpen,
    setIsMoveToCollectionOpen,
    setToMoveCollection,
  } = useModalsStates();

  const invalidateCollectionsQueries = useInvalidateCollectionsQueries();
  const deleteHandler = () => {
    axios
      .delete(`collection/${id}`)
      .then((res) => {
        invalidateCollectionsQueries();
      })
      .catch((err) => err);
  };

  const editHandler = () => {
    setEditId(id);
    setDefaultValues({
      collectionName: collection?.name,
      collectionPublic: collection?.public,
    });
    setIsCollectionModalOpen(true);
  };
  const moveHandler = () => {
    setEditId(id);
    setIsMoveToCollectionOpen(true);
    setToMoveCollection(collection);
  };

  return (
    <ItemCard
      id={id}
      Icon={<Folder />}
      name={collection.name}
      editHandler={editHandler}
      deleteHandler={deleteHandler}
      moveHandler={moveHandler}
    />
  );
};

export default Collection;
