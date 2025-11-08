import { Link, useNavigate } from "react-router-dom";
import { CollectionType } from "@/hooks/useGetCollections";
import { Folder } from "lucide-react";
import useModalsStates from "@/hooks/useModalsStates";
import ItemCard from "./ui/ItemCard";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useCollectionActions from "@/hooks/useCollectionActions";
import useToasts from "@/hooks/useToasts";

type CollectionProps = {
  collection: CollectionType;
  sectionId?: string;
  to?: string;
};

const Collection = ({ collection, sectionId, to }: CollectionProps) => {
  const id = collection._id;
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const handleNavigate = () => {
    navigate(`/collection/${id}`);
  };

  const {
    setEditId,
    setDefaultValues,
    setIsCollectionModalOpen,
    setIsMoveToCollectionOpen,
    setToMoveCollection,
    setIsShareModalOpen,
    setShareItemId,
    setShareItemName,
    setDeleteCollectionModalData,
     setIsDeleteCollectionModalOpen,
  } = useModalsStates();

  const deleteHandler = () => {
    setDeleteCollectionModalData({ id, showCardsInHome: collection.showCardsInHome });
    setIsDeleteCollectionModalOpen(true);
  };
  // const deleteHandler = async () => {
  //   const toast = addToast("Deleting collection...", "promise");
  //   try {
  //     await deleteCollectionHandler(id);
  //     toast.setToastData({
  //       title: "Collection deleted successfully",
  //       type: "success",
  //     });
  //   } catch (error) {
  //     toast.setToastData({
  //       title: "Failed to delete collection",
  //       type: "error",
  //     });
  //   }
  // };

  const editHandler = () => {
    setEditId(id);
    setDefaultValues({
      collectionName: collection?.name,
      collectionPublic: collection?.public,
      collectionShowCardsInHome: collection?.showCardsInHome,
      parentCollectionId: collection.parentCollectionId,
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

  console.log("collection", collection);
  const isSameUser = user?._id === collection.userId;

  console.log(user?._id, collection);
  const totalCardsCount = collection.cardsCount || 0;
  const subCollectionsCount = collection.subCollections?.length || 0;

  const subText = (
    <div className="flex gap-4 items-center">
      <div className="flex flex-col items-center">
        <h6 className="text-xl font-bold" data-testid="cards-count">
          {totalCardsCount}
        </h6>
        <p className="font-semibold text-gray-400">Cards</p>
      </div>
      {subCollectionsCount > 0 && (
        <div className="flex flex-col items-center">
          <h6 className="text-xl font-bold" data-testid="subcollections-count">
            {subCollectionsCount}
          </h6>
          <p className="font-semibold text-gray-400">Sub Collections</p>
        </div>
      )}
    </div>
  );

  return (
    <ItemCard
      isSameUser={isSameUser}
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
      onClick={handleNavigate}
      className="transition-colors cursor-pointer hover:bg-gray-50"
    />
  );
};

export default Collection;
