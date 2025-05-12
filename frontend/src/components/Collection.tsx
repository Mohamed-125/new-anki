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
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

type CollectionProps = {
  collection: CollectionType;
  sectionId?: string;
  to?: string;
};

const Collection = ({ collection, sectionId, to }: CollectionProps) => {
  const id = collection._id;

  const {
    setEditId,
    setDefaultValues,
    setIsCollectionModalOpen,
    setIsMoveToCollectionOpen,
    setToMoveCollection,
    setIsShareModalOpen,
    setShareItemId,
    setShareItemName,
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

    console.log(collection);
    setDefaultValues({
      collectionName: collection?.name,
      collectionPublic: collection?.public,
      collectionShowCardsInHome: collection?.showCardsInHome,
    });
    setIsCollectionModalOpen(true);
  };
  const moveHandler = () => {
    setEditId(id);
    setIsMoveToCollectionOpen(true);
    setToMoveCollection(collection);
  };

  const shareHandler = () => {
    setIsShareModalOpen(true);
    setShareItemId(collection._id);
    setShareItemName(collection.name);
  };

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === collection.userId;

  return (
    <ItemCard
      isSameUser={isSameUser || Boolean(sectionId)}
      id={id}
      to={to}
      sectionId={sectionId}
      Icon={<Folder />}
      name={collection.name}
      editHandler={editHandler}
      deleteHandler={deleteHandler}
      moveHandler={moveHandler}
      shareHandler={shareHandler}
    />
  );
};

export default Collection;
