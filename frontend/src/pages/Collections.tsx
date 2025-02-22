import axios from "axios";
import Collection from "../components/Collection";
import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useQueryClient } from "@tanstack/react-query";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import AddNewCollectionModal from "../components/AddNewCollectionModal";
import useGetCollectionsContext from "../hooks/useGetCollectionsContext";
import { CollectionType } from "../context/CollectionsContext";
import MoveCollectionModal from "@/components/MoveCollectionModal";

const Collections = () => {
  const { collections, notParentCollections } = useGetCollectionsContext();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  // const [collectionCards, setCollectionsCards] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionType[]
  >(collections || []);
  const [isMoveToCollectionOpen, setIsMoveToCollectionOpen] = useState(false);
  const [toMoveCollectionId, setToMoveCollectionId] = useState("");
  const [parentCollectionId, setParentCollectionId] = useState("");

  useEffect(() => {
    if (!isCollectionModalOpen) {
      ("tsrtarstr");
      setDefaultValues({});
    }
  }, [isCollectionModalOpen]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useAddModalShortcuts(setIsCollectionModalOpen);

  // if (isLoading || !collections) {
  //   return <Loading />;
  // }

  return (
    <div className="container px-6 py-8 mx-auto max-w-7xl">
      <MoveCollectionModal
        isMoveToCollectionOpen={isMoveToCollectionOpen}
        setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
        editId={editId}
        setEditId={setEditId}
        toMoveCollectionId={toMoveCollectionId}
        setParentCollectionId={setParentCollectionId}
        setSelectedItems={setSelectedItems}
        selectedItems={selectedItems}
        isCollectionModalOpen={isCollectionModalOpen}
        setisCollectionModalOpen={setIsCollectionModalOpen}
      />
      <AddNewCollectionModal
        setIsCollectionModalOpen={setIsCollectionModalOpen}
        isCollectionModalOpen={isCollectionModalOpen}
        defaultValues={defaultValues}
        parentCollectionId={parentCollectionId}
        editId={editId}
      />
      {notParentCollections?.length ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <Button
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              onClick={() => setIsCollectionModalOpen(true)}
            >
              <span className="text-xl">+</span>
              Create new collection
            </Button>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Search
              setState={setFilteredCollections}
              label="Search your collections"
              items={notParentCollections}
              filter="name"
            />

            <div className="flex flex-col gap-4 justify-between items-start mt-4 sm:flex-row sm:items-center">
              <h6 className="text-sm font-medium text-gray-500">
                {notParentCollections?.length} collections
              </h6>
              {selectedItems.length > 0 && (
                <SelectedItemsController
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  isItemsCollections={true}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-1">
            {filteredCollections
              .filter((collection) => !collection?.parentCollectionId)
              .map((collection) => (
                <Collection
                  setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                  setToMoveCollectionId={setToMoveCollectionId}
                  collection={collection}
                  key={collection._id}
                  setDefaultValues={setDefaultValues}
                  setIsCollectionModalOpen={setIsCollectionModalOpen}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setEditId={setEditId}
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
            className="flex gap-2 items-center px-6 py-3 text-white bg-blue-600 rounded-lg shadow-sm transition-colors hover:bg-blue-700"
            onClick={() => setIsCollectionModalOpen(true)}
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
