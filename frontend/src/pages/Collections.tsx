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

const Collections = () => {
  const { collections, notParentCollections } = useGetCollectionsContext();
  const [isCollectionsModalOpen, setIsCollectionModalOpen] = useState(false);
  // const [collectionCards, setCollectionsCards] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionType[]
  >(collections || []);

  const [actionsDivId, setActionsDivId] = useState("");

  // the mutation logic for adding a collection and optimistic updates
  const queryClient = useQueryClient();

  const deleteCollectionHandler = (collectionId: string) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["collections"] });
      })
      .catch((err) => err);
  };

  useEffect(() => {
    if (!isCollectionsModalOpen) {
      ("tsrtarstr");
      setDefaultValues({});
    }
  }, [isCollectionsModalOpen]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useAddModalShortcuts(setIsCollectionModalOpen);

  // if (isLoading || !collections) {
  //   return <Loading />;
  // }

  return (
    <div className="container">
      <AddNewCollectionModal
        setIsCollectionModalOpen={setIsCollectionModalOpen}
        isCollectionsModalOpen={isCollectionsModalOpen}
        defaultValues={defaultValues}
        editId={editId}
      />

      {notParentCollections?.length ? (
        <div>
          <Search
            setState={setFilteredCollections}
            label={"Search your collections"}
            items={notParentCollections}
            filter={"name"}
          />
          <h6 className="mt-4 text-lg font-bold text-gray-400">
            Number of collections : {notParentCollections?.length}
          </h6>
          <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isItemsCollections={true}
          />

          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
            onClick={() => setIsCollectionModalOpen(true)}
          >
            Create new collection
          </Button>

          {/* <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isItemsCollections={true}
          /> */}

          <div className="grid gap-2 grid-container">
            {filteredCollections
              .filter((collection) => !collection?.parentCollectionId)
              .map((collection) => (
                <Collection
                  collection={collection}
                  key={collection._id}
                  defaultValues={defaultValues}
                  deleteHandler={deleteCollectionHandler}
                  setDefaultValues={setDefaultValues}
                  setIsCollectionModalOpen={setIsCollectionModalOpen}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setEditId={setEditId}
                  setActionsDivId={setActionsDivId}
                  isActionDivOpen={actionsDivId === collection._id}
                />
              ))}
          </div>

          <Search.NotFound
            state={filteredCollections}
            searchFor={"collection"}
            filter={"name"}
          />
        </div>
      ) : (
        <Button
          className="mt-11"
          size="fit"
          center={true}
          onClick={() => setIsCollectionModalOpen(true)}
        >
          There is not collections Create Your First Now{" "}
        </Button>
      )}
    </div>
  );
};

export default Collections;
