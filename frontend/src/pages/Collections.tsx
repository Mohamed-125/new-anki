import axios from "axios";
import Collection from "../components/Collection";
import { useState } from "react";
import Button from "../components/Button";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import AddNewCollectionModal from "../components/AddNewCollectionModal";
import useGetCollections, { CollectionType } from "../hooks/useGetCollections";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import useModalStates from "@/hooks/useModalsStates";

const Collections = () => {
  const { collections, notParentCollections } = useGetCollections();
  // const [collectionCards, setCollectionsCards] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionType[]
  >(collections || []);

  const states = useModalStates();
  useAddModalShortcuts(states.setIsCollectionModalOpen);

  // if (isLoading || !collections) {
  //   return <Loading />;
  // }

  return (
    <div className="container px-6 py-8 mx-auto max-w-7xl">
      <MoveCollectionModal />
      <AddNewCollectionModal />
      {states.selectedItems.length > 0 && (
        <SelectedItemsController isItemsCollections={true} />
      )}
      {notParentCollections?.length ? (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <Search
              setState={setFilteredCollections}
              label="Search your collections"
              items={notParentCollections}
              filter="name"
            />

            <div className="flex flex-col items-start justify-between gap-4 mt-4 sm:flex-row sm:items-center">
              <h6 className="text-sm font-medium text-gray-500">
                {notParentCollections?.length} collections
              </h6>
            </div>
          </div>
          <Button
            className="flex ml-auto items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            onClick={() => states.setIsCollectionModalOpen(true)}
          >
            <span className="text-xl">+</span>
            Create new collection
          </Button>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-1">
            {filteredCollections
              .filter((collection) => !collection?.parentCollectionId)
              .map((collection) => (
                <Collection
                  {...states}
                  collection={collection}
                  key={collection._id}
                />
              ))}
          </div>

          <Search.NotFound
            state={filteredCollections}
            searchFor="collection"
            filter="name"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              No Collections Yet
            </h2>
            <p className="text-gray-500">
              Create your first collection to get started
            </p>
          </div>
          <Button
            className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
            onClick={() => states.setIsCollectionModalOpen(true)}
          >
            <span className="text-xl">+</span>
            Create your first collection
          </Button>
        </div>
      )}
    </div>
  );
};

export default Collections;
