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
import { Virtuoso } from "react-virtuoso";
import { useNetwork } from "@/context/NetworkStatusContext";
import useDb from "@/db/useDb";
import OfflineFallback from "@/components/OfflineFallback";

const Home = () => {
  const { user } = useGetCurrentUser();
  const { isOnline } = useNetwork();
  const { getCards } = useDb(user?._id);
  const [hasOfflineData, setHasOfflineData] = useState(true);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    userCards,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    cardsCount,
    hasNextPage,
  } = useGetCards({ query: debouncedQuery });

  useEffect(() => {
    const checkOfflineData = async () => {
      if (!isOnline) {
        // Try to get user ID from localStorage if not available from online state
        const storedUserId = localStorage.getItem("userId");
        const db = storedUserId ? useDb(storedUserId) : null;
        if (db) {
          const cards = await db.getCards();
          setHasOfflineData(!!cards?.length);
        } else {
          setHasOfflineData(false);
        }
      }
    };
    checkOfflineData();
  }, [isOnline, getCards]);

  const states = useModalStates();

  const allCardIds = useMemo(() => {
    if (!userCards) return null;
    return userCards.map((card) => card._id) || [];
  }, [userCards]);

  if (!isOnline && !hasOfflineData) {
    return <OfflineFallback />;
  }

  return (
    <div className="container">
      <AddCardModal />
      <MoveCollectionModal cards={userCards ?? []} />
      <AddNewCollectionModal />
      {!isOnline && hasOfflineData && (
        <div className="mb-4 py-3 px-4 text-center text-amber-800 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">You're currently offline. Your changes will be synced when you reconnect.</span>
          </div>
        </div>
      )}
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

      <div className="overflow-hidden">
        {isLoading ? (
          <CardsSkeleton cards={[]} />
        ) : userCards?.length ? (
          <Virtuoso
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
            style={{ height: "100%", width: "100%" }}
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
