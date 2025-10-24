import React, { useMemo, useState, useEffect, useRef } from "react";
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
import useDebounce from "../hooks/useDebounce";
import Form from "@/components/Form";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import useModalStates from "@/hooks/useModalsStates";
import InfiniteScroll from "@/components/InfiniteScroll";
import { Virtuoso } from "react-virtuoso";

const Home = () => {
  const { user } = useGetCurrentUser();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    userCards,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    cardsCount,
    hasNextPage,
  } = useGetCards({ query: debouncedQuery }); // Pass the query here

  const states = useModalStates();

  console.log(userCards);
  // Extract all card IDs for select all functionality
  const allCardIds = useMemo(() => {
    if (!userCards) return null;

    return userCards.map((card) => card._id) || [];
  }, [userCards]);

  const CardsJSX = useMemo(() => {
    if (!userCards || !userCards.length) return null;

    const cards = userCards.map((card) => (
      <Card key={card._id} card={card} id={card._id} />
    ));

    return cards;
  }, [userCards, user?._id, states?.selectedItems]); // Ensure minimal dependencies
  const scrollParentRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="container">
      <AddCardModal />
      <MoveCollectionModal cards={userCards ?? []} />
      <AddNewCollectionModal />
      <SelectedItemsController itemType="cards" allItems={allCardIds} />
      <h6 className="mb-4 text-lg font-bold text-gray-400">
        Your Cards : {cardsCount}
      </h6>
      <Search searchingFor="cards" query={query} setQuery={setQuery} />
      <div className="flex gap-2 justify-between items-center my-5">
        <Link to="/study">
          <Button variant="primary-outline" className="py-3 sm:text-sm">
            Study Your Cards
          </Button>
        </Link>

        <Button
          className={"py-3 sm:text-sm"}
          onClick={() => states.setIsAddCardModalOpen(true)}
        >
          Create a new card
        </Button>
      </div>

      <div>
        {isLoading ? (
          <CardsSkeleton cards={[]} />
        ) : userCards?.length ? (
          // <InfiniteScroll
          //   fetchNextPage={fetchNextPage}
          //   isFetchingNextPage={isFetchingNextPage}
          //   hasNextPage={hasNextPage}
          //   loadingElement={<CardsSkeleton cards={userCards} />}
          // >
          //   {CardsJSX}
          // </InfiniteScroll>
          <Virtuoso
            // customScrollParent={scrollParentRef.current || undefined}
            // style={{ height: "60vh" }}
            useWindowScroll
            data={userCards}
            itemContent={(index, card) => (
              <div className="py-2">
                <Card key={card._id} card={card} id={card._id} />
              </div>
            )}
            endReached={() => hasNextPage && fetchNextPage()}
            components={{
              Footer: () =>
                isFetchingNextPage ? <CardsSkeleton cards={userCards} /> : null,
            }}
          />
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
      </div>
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
