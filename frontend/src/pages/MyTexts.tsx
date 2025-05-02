import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import { useNavigate } from "react-router-dom";
import useModalsStates from "@/hooks/useModalsStates";
import ItemCard from "@/components/ui/ItemCard";
import { Text } from "lucide-react";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useGetTexts from "@/hooks/useGetTexts";
import useInfiniteScroll from "@/components/InfiniteScroll";
import Search from "@/components/Search";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import useToasts from "@/hooks/useToasts";
import InfiniteScroll from "@/components/InfiniteScroll";

export type TextType = {
  title: string;
  content: string;
  userId: string;
  topicId?: string;
  defaultCollectionId: string | undefined;
};

const MyTexts = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    texts,
    textsCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
  } = useGetTexts({ query: debouncedQuery });

  const queryClient = useQueryClient();
  const isLoading = isFetchingNextPage || isInitialLoading;
  const invalidateTextQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["texts"] });
  };

  const { addToast } = useToasts();

  const deleteTextHandler = async (id: string) => {
    const element = document.getElementById(id)!;
    const dropDownContent = document.querySelector(
      ".dropdown-content"
    )! as HTMLElement;

    if (element) {
      element.style.display = "none";
    }
    if (dropDownContent) {
      dropDownContent.style.display = "none";
    }
    const deleteRes = await axios.delete(`text/${id}`).then(() => {
      invalidateTextQueries();
      addToast("Text deleted successfully");
    });
    return;
  };

  const {
    setEditId,
    setIsTextModalOpen,
    setIsShareModalOpen,
    setShareItemId,
    setShareItemName,
  } = useModalsStates();

  const navigate = useNavigate();
  const editHandler = (text: TextType & { _id: string }) => {
    setEditId(text._id);
    navigate("/texts/edit/" + text._id);
    setIsTextModalOpen(true);
  };

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Texts</h1>

      {/* <AddNewTextModal /> */}
      <>
        <SelectedItemsController isItemsTexts={true} />
        <Search query={query} setQuery={setQuery} searchingFor="texts" />
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Number of texts : {textsCount}
        </h6>{" "}
        <Button
          onClick={() => navigate("/texts/new")}
          className="py-4 my-6 mr-0 ml-auto text-white bg-blue-600 border-none"
        >
          Add new text
        </Button>
        <InfiniteScroll
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadingElement={<CollectionSkeleton />}
          className="grid gap-4 grid-container"
        >
          {texts?.map((text) => {
            const shareHandler = () => {
              setIsShareModalOpen(true);
              setShareItemId(text._id);
              setShareItemName(text.title);
            };
            return (
              <ItemCard
                Icon={<Text />}
                editHandler={() =>
                  editHandler(text as TextType & { _id: string })
                }
                shareHandler={shareHandler}
                deleteHandler={() => deleteTextHandler(text._id)}
                name={text.title}
                key={text._id}
                id={text._id}
              />
            );
          })}
        </InfiniteScroll>
      </>
    </div>
  );
};

export default MyTexts;
