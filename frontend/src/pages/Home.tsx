import axios from "axios";
import React, {
  FormEvent,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Card from "../components/Card";
import AddCardModal from "../components/AddCardModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent";
import useGetCards, { CardType } from "../hooks/useGetCards";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { Link, useLocation } from "react-router-dom";
import MoveCollectionModal from "../components/MoveCollectionModal";
import { toastContext } from "../context/ToastContext";
import useToasts from "../hooks/useToasts";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import CardsSkeleton from "@/components/CardsSkeleton";
import useDebounce from "@/hooks/useDebounce";
import Form from "@/components/Form";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import useModalStates from "@/hooks/useModalsStates";

const Home = () => {
  const { user } = useGetCurrentUser();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    userCards,
    fetchNextPage,
    isFetchingNextPage,
    isIntialLoading,
    cardsCount,
  } = useGetCards({ query: debouncedQuery }); // Pass the query here

  useInfiniteScroll(fetchNextPage);
  const states = useModalStates();

  const CardsJSX = useMemo(() => {
    if (!userCards) return null;

    console.log(userCards);
    // Set loading state while computing cards

    const cards = userCards.map((card) => (
      <Card
        key={card._id}
        card={card}
        id={card._id}
        isSameUser={card.userId === user?._id}
      />
    ));

    // Reset loading state after computation is complete

    return cards;
  }, [userCards, user?._id, states?.selectedItems]); // Ensure minimal dependencies

  return (
    <div className="container">
      <AddCardModal />
      <MoveCollectionModal cards={userCards ?? []} />
      <AddNewCollectionModal />
      <SelectedItemsController isItemsCards={true} />
      <SearchCards query={query} setQuery={setQuery} />
      <h6 className="mt-4 text-lg font-bold text-gray-400">
        Your Cards : {cardsCount}
      </h6>
      <div className="flex items-center justify-between mt-2">
        <Link to="/study-cards">
          <Button variant="primary-outline" className="px-3 py-3 sm:text-sm">
            Study Your Cards
          </Button>
        </Link>

        <Button
          className={"my-7 sm:text-sm py-3 px-2"}
          onClick={() => states.setIsAddCardModalOpen(true)}
        >
          Create a new card
        </Button>
      </div>
      {isIntialLoading || !userCards ? (
        <CardsSkeleton />
      ) : (
        <>
          {userCards.length ? (
            <div>
              {CardsJSX}
              {isFetchingNextPage && <CardsSkeleton />}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Button
                center={true}
                className="mt-11"
                onClick={() => states.setIsAddCardModalOpen(true)}
              >
                There is not any card yet. Click to Add a new card
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

type SearchCardsProps = {
  query: string;
  setQuery: (query: string) => void;
};

const SearchCards = React.memo(function SearchCards({
  query,
  setQuery,
}: SearchCardsProps) {
  return (
    <>
      <Form
        className={
          "flex px-0 py-0 w-full max-w-none text-lg bg-transparent rounded-xl"
        }
      >
        <div className="grow">
          <Form.Label>Search Your Cards</Form.Label>
          <Form.Input
            className="py-2 text-black bg-gray-200 rounded-xl"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            name="query"
          />
        </div>
      </Form>
    </>
  );
});
