import React, { useMemo, useState } from "react";
import Card from "../components/Card";
import AddCardModal from "../components/AddCardModal";
import Button from "../components/Button";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import useGetCards from "../hooks/useGetCards";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { Link } from "react-router-dom";
import MoveCollectionModal from "../components/MoveCollectionModal";
import CardsSkeleton from "@/components/CardsSkeleton";
import useDebounce from "@/hooks/useDebounce";
import Form from "@/components/Form";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import useModalStates from "@/hooks/useModalsStates";
import InfiniteScroll from "@/components/InfiniteScroll";

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
    hasNextPage,
  } = useGetCards({ query: debouncedQuery }); // Pass the query here

  const states = useModalStates();

  const CardsJSX = useMemo(() => {
    if (!userCards) return null;

    // Set loading state while computing cards

    const cards = userCards.map((card) => (
      <Card key={card._id} card={card} id={card._id} />
    ));

    // Reset loading state after computation is complete

    return cards;
  }, [userCards, user?._id, states?.selectedItems]); // Ensure minimal dependencies

  return (
    <div className="container">
      {/* <div className="absolute z-50 w-7/12 h-12 bg-red-400" id="translateBtn">
        heeey
      </div> */}
      <AddCardModal />
      <MoveCollectionModal cards={userCards ?? []} />
      <AddNewCollectionModal />
      <SelectedItemsController isItemsCards={true} />
      <Search searchingFor="cards" query={query} setQuery={setQuery} />
      <h6 className="mt-4 text-lg font-bold text-gray-400">
        Your Cards : {cardsCount}
      </h6>
      <div className="flex gap-2 justify-between items-center mt-2">
        <Link to="/study-cards">
          <Button
            variant="primary-outline"
            className="px-3 py-3 sm:px-2 sm:text-sm"
          >
            Study Your Cards
          </Button>
        </Link>

        <Button
          className={"px-2 py-3 my-7 sm:px-2 sm:text-sm"}
          onClick={() => states.setIsAddCardModalOpen(true)}
        >
          Create a new card
        </Button>
      </div>

      <>
        {userCards?.length ? (
          <InfiniteScroll
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            loadingElement={<CardsSkeleton />}
          >
            {CardsJSX}
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Button
              center={true}
              className="mt-11"
              onClick={() => states.setIsAddCardModalOpen(true)}
            >
              There is not any card yet.
              <br></br> Click to Add a new card
            </Button>
          </div>
        )}
      </>
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
