import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/Card";
import axios from "axios";
import Loading from "../components/Loading";
import Button from "../components/Button";
import AddCardModal from "../components/AddCardModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent.tsx";
import { CardType } from "../hooks/useGetCards.tsx";
import Search from "../components/Search.tsx";
import useGetCurrentUser from "../hooks/useGetCurrentUser.tsx";
import AddNewCollectionModal from "../components/AddNewCollectionModal.tsx";
import Collection from "../components/Collection.tsx";
import MoveCollectionModal from "../components/MoveCollectionModal.tsx";
import { CollectionType } from "../context/CollectionsContext.tsx";

const CollectionPage = ({}) => {
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean); // Split and remove empty segments
  const id = pathArray[pathArray.length - 1]; // Get the last segment
  const { user } = useGetCurrentUser();

  const {
    data: collection,
    isLoading: collectionLoading,
    isError,
  } = useQuery({
    queryKey: ["collection", id],
    refetchOnWindowFocus: false,

    queryFn: () => axios.get("collection/" + id).then((res) => res.data),
  });

  const [localCollectionCards, setLocalCollectionCards] = useState(
    (collection?.collectionCards as CardType[]) ?? []
  );

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [actionsDivId, setActionsDivId] = useState("");
  const [changeItemsParent, setChangeItemsParent] = useState(false);
  const [filteredCards, setFilteredCards] = useState(localCollectionCards);

  useEffect(() => {
    setLocalCollectionCards(collection?.collectionCards);
  }, [collection]);

  const isLoading = collectionLoading;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [isCollectionsModalOpen, setIsCollectionModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const deleteCollectionHandler = (collectionId: string) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["collections"] });
        queryClient.invalidateQueries({ queryKey: ["collection", id] });
      })
      .catch((err) => err);
  };

  const [isMoveToCollectionOpen, setIsMoveToCollectionOpen] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container">
      <div className="">
        <h4 className="mt-4 text-5xl font-bold text-"> {collection?.name}</h4>

        <>
          <AddNewCollectionModal
            setIsCollectionModalOpen={setIsCollectionModalOpen}
            isCollectionsModalOpen={isCollectionsModalOpen}
            defaultValues={defaultValues}
            editId={editId}
            parentCollectionId={id}
          />
          <MoveCollectionModal
            isMoveToCollectionOpen={isMoveToCollectionOpen}
            setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
            editId={editId}
            cards={localCollectionCards}
          />
          <AddCardModal
            collectionId={collection?._id}
            isAddCardModalOpen={isAddCardModalOpen}
            setIsAddCardModalOpen={setIsAddCardModalOpen}
            defaultValues={defaultValues}
            content={content}
            setDefaultValues={setDefaultValues}
            setContent={setContent}
            editId={editId}
            setEditId={setEditId}
            optimistic={{
              isOptimistic: true,
              setOptimistic: setLocalCollectionCards,
            }}
          />
          <ChangeItemsParent
            changeItemsParent={changeItemsParent}
            setChangeItemsParent={setChangeItemsParent}
            itemsType={"card"}
            itemsIds={selectedItems}
            parentName="collection"
          />

          <Search
            setState={setFilteredCards}
            label={"Search your cards"}
            items={localCollectionCards}
            filter={"front"}
          />

          <h6 className="mt-4 text-lg font-bold text-gray-400">
            Sub colleciton in this collection :{" "}
            {collection?.subCollections?.length}
          </h6>
          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
            onClick={() => {
              setDefaultValues({ parentCollectionId: id });
              setIsCollectionModalOpen(true);
            }}
          >
            Create New Sub Collection
          </Button>
          <div>
            <div className="grid gap-2 grid-container">
              {collection?.subCollections.map((collection: CollectionType) => (
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
              ))}{" "}
            </div>
          </div>
          <h6 className="mt-4 text-lg font-bold text-gray-400">
            Cards in collection : {localCollectionCards?.length}
          </h6>
          {localCollectionCards?.length ? (
            <div className="container">
              {user?._id === collection.userId ? (
                <>
                  <Button variant="primary-outline">
                    <Link to={"/study-cards/" + id}>Study Your Cards</Link>
                  </Button>
                  <Button
                    className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
                    onClick={() => {
                      setDefaultValues({ collectionId: id });
                      setIsAddCardModalOpen(true);
                    }}
                  >
                    Add new card to this collection
                  </Button>
                </>
              ) : (
                <>
                  {user?.collections?.find(
                    (userCollection) => userCollection === collection?.id
                  ) ? (
                    <Button
                      className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
                      onClick={async () => {
                        await axios.post(
                          "collection/forkCollection/" + collection?.id
                        );
                      }}
                    >
                      this collection is already forked
                    </Button>
                  ) : (
                    <Button
                      className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
                      onClick={async () => {
                        await axios.post(
                          "collection/forkCollection/" + collection?.id
                        );
                      }}
                    >
                      Add This Collection to your collections
                    </Button>
                  )}
                </>
              )}

              <SelectedItemsController
                selectedItems={selectedItems}
                setChangeItemsParent={setChangeItemsParent}
                setSelectedItems={setSelectedItems}
              />

              <div className="">
                {filteredCards?.map((card) => (
                  <Card
                    setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                    setIsModalOpen={setIsAddCardModalOpen}
                    key={card._id}
                    card={card}
                    setContent={setContent}
                    setDefaultValues={setDefaultValues}
                    id={card._id}
                    setActionsDivId={setActionsDivId}
                    setSelectedItems={setSelectedItems}
                    setIsAddCardModalOpen={setIsAddCardModalOpen}
                    selectedItems={selectedItems}
                    setEditId={setEditId}
                    isSameUser={user?._id === collection.userId}
                    isActionDivOpen={actionsDivId === card._id}
                    collectionId={collection?._id}
                  />
                ))}
              </div>
            </div>
          ) : user?._id === collection?.userId ? (
            <Button
              className="mt-11"
              onClick={() => {
                setDefaultValues({ collectionId: id });
                setIsAddCardModalOpen(true);
              }}
            >
              There is not cards in this collection. Click to create Your First
              Now{" "}
            </Button>
          ) : (
            <p className="mt-11"> There is not cards in this collection</p>
          )}
        </>
      </div>
    </div>
  );
};

export default CollectionPage;
