import React from "react";
import { CollectionType } from "@/hooks/useGetCollections";
import { Folder } from "lucide-react";
import useModalsStates from "@/hooks/useModalsStates";
import ItemCard from "./ui/ItemCard";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useCollectionActions from "@/hooks/useCollectionActions";

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

  const { deleteCollectionHandler } = useCollectionActions();

  const deleteHandler = () => {
    deleteCollectionHandler(id);
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

  console.log(user?._id, collection);
  const subText = (
    <div className="flex flex-col items-center">
      <h6 className="text-xl font-bold">{collection.cardsCount || 0}</h6>
      <p className="font-semibold text-gray-400">Cards</p>
    </div>
  );

  return (
    <ItemCard
      isSameUser={isSameUser || Boolean(sectionId)}
      id={id}
      to={to}
      sectionId={sectionId}
      Icon={<Folder />}
      name={collection.name}
      subText={subText}
      editHandler={editHandler}
      deleteHandler={deleteHandler}
      moveHandler={moveHandler}
      shareHandler={shareHandler}
    />
  );
};

export default Collection;
