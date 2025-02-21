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

const Home = () => {
  const { user } = useGetCurrentUser();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [actionsDivId, setActionsDivId] = useState("");
  const [changeItemsParent, setChangeItemsParent] = useState(false);
  const [isMoveToCollectionOpen, setIsMoveTooCollectionOpen] = useState(false);
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query);

  const {
    userCards,
    fetchNextPage,
    isFetchingNextPage,
    isIntialLoading,
    cardsCount,
  } = useGetCards({ query: debouncedQuery }); // Pass the query here
  const [isLoading, setIsLoading] = useState(isFetchingNextPage);

  console.log("usercards", userCards);
  const {} = useInfiniteScroll(fetchNextPage);
  useEffect(() => {}, [editId]);

  const CardsJSX = useMemo(() => {
    if (!userCards) return null;

    // Set loading state while computing cards

    const cards = userCards.map((card) => (
      <Card
        key={card._id}
        card={card}
        id={card._id}
        isSameUser={card.userId === user?._id}
        isActionDivOpen={actionsDivId === card._id}
        selectedItems={selectedItems}
        setIsModalOpen={setIsAddCardModalOpen}
        setEditId={setEditId}
        setContent={setContent}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        setActionsDivId={setActionsDivId}
        setSelectedItems={setSelectedItems}
        setIsMoveToCollectionOpen={setIsMoveTooCollectionOpen}
      />
    ));

    // Reset loading state after computation is complete

    return cards;
  }, [userCards, user?._id, selectedItems]); // Ensure minimal dependencies
  useEffect(() => {}, [userCards]);

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
        isMoveToCollectionOpen={isMoveToCollectionOpen}
      />
      <MoveCollectionModal
        setTargetCollectionId={setTargetCollectionId}
        isMoveToCollectionOpen={isMoveToCollectionOpen}
        setIsMoveToCollectionOpen={setIsMoveTooCollectionOpen}
        editId={editId}
        setEditId={setEditId}
        cards={userCards}
      />
      <ChangeItemsParent
        changeItemsParent={changeItemsParent}
        setChangeItemsParent={setChangeItemsParent}
        itemsType={"card"}
        itemsIds={selectedItems}
        parentName="collection"
      />

      <SearchCards query={query} setQuery={setQuery} />
      <h6 className="mt-4 text-lg font-bold text-gray-400">
        Your Cards : {cardsCount}
      </h6>
      <div className="flex justify-between items-center mt-2">
        <Link to="/study-cards">
          <Button variant="primary-outline" className="">
            Study Your Cards
          </Button>
        </Link>

        <Button className={"my-7"} onClick={() => setIsAddCardModalOpen(true)}>
          Create a new card
        </Button>
      </div>
      <SelectedItemsController
        setChangeItemsParent={setChangeItemsParent}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      {isIntialLoading || !userCards ? (
        <CardsSkeleton />
      ) : (
        <>
          {userCards.length ? (
            <div>
              {CardsJSX}
              {(isLoading || isFetchingNextPage) && <CardsSkeleton />}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Button
                center={true}
                className="mt-11"
                onClick={() => setIsAddCardModalOpen(true)}
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
