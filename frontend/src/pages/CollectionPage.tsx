import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import axios from "axios";
import Loading from "../components/Loading";
import Button from "../components/Button";
import AddCardModal from "../components/AddCardModal";
import { useQuery } from "@tanstack/react-query";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent.tsx";
import { CardType } from "../hooks/useGetCards.tsx";
import Search from "../components/Search.tsx";
import useGetCurrentUser from "../hooks/useGetCurrentUser.tsx";

const CollectionPage = ({}) => {
  const id = useParams().id;
  const { user } = useGetCurrentUser();

  user;

  const {
    data: collection,
    isLoading: collectionLoading,
    isError,
  } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => axios.get("collection/" + id).then((res) => res.data),
  });

  user?._id, collection?.userId;
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
  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="container">
      <div className="px-6 max-w-[850px] mx-auto bg-white py-9 rounded-xl ">
        <h4 className="mt-4 text-5xl font-bold text-"> {collection?.name}</h4>

        <>
          <AddCardModal
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
