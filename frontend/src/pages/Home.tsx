import axios from "axios";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import AddCardModal from "../components/AddCardModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent";
import { CardType } from "../hooks/useGetCards";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { Link, useLocation } from "react-router-dom";
import MoveCollectionModal from "../components/MoveCollectionModal";

const Home = () => {
  const {
    data: userCards,
    isLoading: userCardsIsLoading,
    isError,
  } = useQuery({
    queryKey: ["cards"],
    queryFn: () => {
      return axios.get("card").then((res) => res.data);
    },
  });

  const { user } = useGetCurrentUser();

  const [filteredCards, setFilteredCards] = useState<CardType[]>(userCards);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [actionsDivId, setActionsDivId] = useState("");
  const [changeItemsParent, setChangeItemsParent] = useState(false);
  const [isMoveToCollectionOpen, setIsMoveTooCollectionOpen] = useState(false);
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const isLoading = userCardsIsLoading;
  useEffect(() => {
    console.log("editId", editId);
  }, [editId]);
  if (isLoading || !userCards) {
    return <Loading />;
  }

  return (
    <div className="container">
      <AddCardModal
        setIsMoveToCollectionOpen={setIsMoveTooCollectionOpen}
        isAddCardModalOpen={isAddCardModalOpen}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        defaultValues={defaultValues}
        content={content}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        setEditId={setEditId}
        editId={editId}
        targetCollectionId={targetCollectionId}
      />
      <MoveCollectionModal
        isMoveToCollectionOpen={isMoveToCollectionOpen}
        setIsMoveToCollectionOpen={setIsMoveTooCollectionOpen}
        editId={editId}
        setEditId={setEditId}
        setTargetCollectionId={setTargetCollectionId}
        cards={userCards}
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
        items={userCards}
        filter={"front"}
        filter2={"back"}
      />

      <h6 className="mt-4 text-lg font-bold text-gray-400">
        Your Cards : {userCards?.length}
      </h6>

      <div className="flex items-center justify-between mt-2">
        <Link to="/study-cards">
          <Button variant="primary-outline">Study Your Cards</Button>
        </Link>

        <Button className={"my-7 "} onClick={() => setIsAddCardModalOpen(true)}>
          Create a new card
        </Button>
      </div>

      <SelectedItemsController
        setChangeItemsParent={setChangeItemsParent}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      {userCards.length ? (
        <>
          {filteredCards?.map((card) => {
            return (
              <Card
                setIsModalOpen={setIsAddCardModalOpen}
                isSameUser={card.userId === user?._id}
                setEditId={setEditId}
                setContent={setContent}
                setIsAddCardModalOpen={setIsAddCardModalOpen}
                setDefaultValues={setDefaultValues}
                key={card._id}
                card={card}
                setActionsDivId={setActionsDivId}
                setSelectedItems={setSelectedItems}
                selectedItems={selectedItems}
                setIsMoveToCollectionOpen={setIsMoveTooCollectionOpen}
                isActionDivOpen={actionsDivId === card._id}
                id={card._id}
              />
            );
          })}

          <Search.NotFound
            state={filteredCards}
            searchFor={"cards"}
            filter={"front"}
            filter2={"back"}
          />
        </>
      ) : (
        <Button
          center={true}
          className={"mt-11"}
          onClick={() => setIsAddCardModalOpen(true)}
        >
          There is not any card yet. Click to Add a new card
        </Button>
      )}
    </div>
  );
};

export default Home;
