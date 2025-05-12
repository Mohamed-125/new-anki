import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import axios from "axios";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import { StickyNote } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useGetNotes from "@/hooks/useGetNotes";
import Search from "@/components/Search";
import useDebounce from "@/hooks/useDebounce";
import useToasts from "@/hooks/useToasts";
import { useNavigate } from "react-router-dom";
import ShareModal from "@/components/ShareModal";
import useModalsStates from "@/hooks/useModalsStates";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import InfiniteScroll from "@/components/InfiniteScroll";

const Notes = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const navigate = useNavigate();

  const {
    notes,
    notesCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
  } = useGetNotes({ query: debouncedQuery });

  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const deleteNoteHandler = async (id: string) => {
    const toast = addToast("Deleting note...", "promise");
    try {
      await axios.delete(`note/${id}`);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.setToastData({
        title: "Note deleted successfully!",
        type: "success",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to delete note", type: "error" });
    }
  };

  const { setIsShareModalOpen, setShareItemId, setShareItemName } =
    useModalsStates();

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === notes?.[0]?.userId;

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Notes</h1>
      <ShareModal sharing="Notes" />
      <>
        <Search query={query} searchingFor="notes" setQuery={setQuery} />
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Number of notes : {notesCount}
        </h6>

        <Button
          className="py-4 my-6 mr-0 ml-auto bg-blue-600 border-none"
          onClick={() => navigate("/notes/new")}
        >
          Add new note
        </Button>

        <SelectedItemsController isItemsNotes={true} />

        <InfiniteScroll
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadingElement={<CollectionSkeleton />}
          hasNextPage={hasNextPage}
          className="grid gap-4 grid-container"
        >
          {notes?.map((note) => {
            const shareHandler = () => {
              setIsShareModalOpen(true);
              setShareItemId(note._id);
              setShareItemName(note.title);
            };

            return (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/edit/${note._id}`)}
              >
                <ItemCard
                  isNotes={true}
                  select={false}
                  isSameUser={isSameUser}
                  shareHandler={shareHandler}
                  id={note._id}
                  Icon={<StickyNote />}
                  name={note.title}
                  deleteHandler={deleteNoteHandler}
                />
              </div>
            );
          })}
        </InfiniteScroll>
      </>
    </div>
  );
};

export default Notes;
