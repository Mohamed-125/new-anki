import axios from "axios";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Form from "../components/Form";
import AddCardModal from "../components/AddCardModal";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";
// import useCreateNewCardMutation from "../hooks/useCreateNewCardMutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useCardActions from "../hooks/useCardActions";
import useDebounce from "../hooks/useDebounced";
import Search from "../components/Search";

const Home = () => {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [acionsDivId, setActionsDivId] = useState("");

  useEffect(() => {
    console.log("actionsDIvedId", acionsDivId);
  }, []);

  const {
    data: userCards,
    isLoading: userCardsIsLoading,
    isError,
  } = useQuery({
    queryKey: ["cards"],
    queryFn: () => axios.get("card").then((res) => res.data),
  });
  const [filteredCards, setFilteredCards] = useState([]);

  const { createCardHandler, isLoading: createNewCardIsLoading } =
    useCreateNewCard();

  const isLoading = userCardsIsLoading || createNewCardIsLoading;

  isLoading && <Loading />;

  const { deleteHandler, updateCardHandler } = useCardActions({
    setIsAddCardModalOpen,
    content,
    editId,
  });

  return (
    <div className="container">
      <AddCardModal
        isAddCardModalOpen={isAddCardModalOpen}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        createCardHandler={createCardHandler}
        defaultValues={defaultValues}
        content={content}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        updateCardHandler={updateCardHandler}
        isEdit={editId}
        setEditId={setEditId}
      />
      <Search
        setState={setFilteredCards}
        label={"Search your cards"}
        items={userCards}
        filter={"word"}
      />
      <Button
        className={"my-7 ml-auto"}
        onClick={() => setIsAddCardModalOpen(true)}
      >
        Create a new card
      </Button>
      {userCards?.length ? (
        <>
          {filteredCards?.map((card) => {
            return (
              <Card
                setEditId={setEditId}
                setContent={setContent}
                content={content}
                setIsAddCardModalOpen={setIsAddCardModalOpen}
                setDefaultValues={setDefaultValues}
                key={card._id}
                front={card.word}
                examples={card.examples}
                back={card.translation}
                deleteHandler={deleteHandler}
                id={card._id}
                setActionsDivId={setActionsDivId}
                isActionDivOpen={acionsDivId === card._id}
              />
            );
          })}

          <Search.NotFound
            state={filteredCards}
            searchFor={"cards"}
            filter={"word"}
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
