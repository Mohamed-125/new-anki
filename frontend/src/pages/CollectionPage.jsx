import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigation, useParams } from "react-router-dom";
import Card from "../components/Card";
import axios from "axios";
import Loading from "../components/Loading";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Form from "../components/Form";
import AddCardModal from "../components/AddCardModal";
import { useQuery } from "@tanstack/react-query";
import useCreateNewCard from "../hooks/useCreateNewCardMutation";

const CollectionPage = ({}) => {
  const id = useParams().id;

  const {
    data: collection,
    isLoading: collectionLoading,
    isError,
  } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => axios.get("collection/" + id).then((res) => res.data),
  });

  const [localCollectionCards, setLocalCollectionCards] = useState(
    collection?.collectionCards ?? []
  );

  const { createCardHandler } = useCreateNewCard({
    isOptimistic: true,
    setState: setLocalCollectionCards,
  });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  useEffect(() => {
    setLocalCollectionCards(collection?.collectionCards);
  }, [collection]);

  const isLoading = collectionLoading;
  if (isLoading) <Loading />;

  return (
    <div className="container">
      <div className="px-6 w-[85%] mx-auto bg-white py-9 rounded-xl ">
        <h4 className="mt-4 text-5xl font-bold text-"> {collection?.name}</h4>

        <>
          <AddCardModal
            isAddCardModalOpen={isAddCardModalOpen}
            setIsAddCardModalOpen={setIsAddCardModalOpen}
            createCardHandler={(e) => {
              createCardHandler(e, { collectionId: id }, setIsAddCardModalOpen);
            }}
          />

          {localCollectionCards?.length ? (
            <div className="container">
              <Button
                className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
                onClick={() => setIsAddCardModalOpen(true)}
              >
                Create new card
              </Button>
              <div className="">
                {localCollectionCards.map((card) => (
                  <Card
                    key={card._id}
                    front={card.word}
                    back={card.translation}
                    id={card._id}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Button
              className="mt-11"
              onClick={() => setIsAddCardModalOpen(true)}
            >
              There is not cards create Your First Now{" "}
            </Button>
          )}
        </>
      </div>
    </div>
  );
};

export default CollectionPage;
