import React, { useState } from "react";
import Card from "@/components/Card";
import Collection from "@/components/Collection";
import Button from "@/components/Button";
import Search from "@/components/Search";
import useDebounce from "@/hooks/useDebounce";
import useGetSectionCards from "@/hooks/useGetSectionCards";
import useGetSectionCollections from "@/hooks/useGetSectionCollections";
import CardsSkeleton from "@/components/CardsSkeleton";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useModalStates from "@/hooks/useModalsStates";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import { AddCardModal } from "@/components/AddCardModal";
import SelectedItemsController from "@/components/SelectedItemsController";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import { Link } from "react-router-dom";

interface AdminSectionCardsProps {
  sectionId: string;
}

const AdminSectionCards = ({ sectionId }: AdminSectionCardsProps) => {
  const {
    setIsCollectionModalOpen,
    setIsAddCardModalOpen,
    selectedItems,
    setDefaultValues,
  } = useModalStates();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const { cards, isLoading: isCardsLoading } = useGetSectionCards({
    sectionId,
    enabled: true,
  });

  const { collections, isLoading: isCollectionsLoading } =
    useGetSectionCollections({
      sectionId,
      enabled: true,
    });

  return (
    <div className="space-y-6">
      {selectedItems.length > 0 && (
        <SelectedItemsController
          isItemsCards={true}
          isItemsCollections={true}
        />
      )}
      <div className="flex gap-4 justify-end">
        <Button
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          onClick={() => {
            setDefaultValues({ sectionId });
            setIsAddCardModalOpen(true);
          }}
        >
          <span className="text-xl">+</span>
          Add Card
        </Button>
        <Button
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          onClick={() => {
            setDefaultValues({ sectionId });
            setIsCollectionModalOpen(true);
          }}
        >
          <span className="text-xl">+</span>
          Add Collection
        </Button>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-1">
          {collections?.map((collection) => (
            <Collection
              to={`/collections/${collection._id}`}
              sectionId={sectionId}
              collection={collection}
              key={collection._id}
            />
          ))}
          {isCollectionsLoading && <CollectionSkeleton />}
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-1">
          {cards?.map((card) => (
            <Card
              sectionId={sectionId}
              card={card}
              key={card._id}
              id={card._id}
            />
          ))}
          {isCardsLoading && <CardsSkeleton />}
        </div>
      </div>
      <MoveCollectionModal sectionId={sectionId} />
      <AddNewCollectionModal />
      <AddCardModal />
    </div>
  );
};

export default AdminSectionCards;
