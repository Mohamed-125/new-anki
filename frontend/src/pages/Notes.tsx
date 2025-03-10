import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import Loading from "../components/Loading";
import axios from "axios";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import Modal from "../components/Modal";
import Form from "../components/Form";
import TipTapEditor from "../components/TipTapEditor";
import { Icon, StickyNote } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useUseEditor from "@/hooks/useUseEditor";
import { Editor } from "@tiptap/react";
import useGetNotes from "@/hooks/useGetNotes";
import useDebounce from "@/hooks/useDebounce";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import Search from "@/components/Search";
import useToasts from "@/hooks/useToasts";

type NoteType = {
  title: string;
  content: string;
  _id: string;
};
const Notes = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    notes,
    notesCount,
    fetchNextPage,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNotes({ query: debouncedQuery });

  useInfiniteScroll(fetchNextPage, hasNextPage);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  const deleteNoteHandler = async (id: string) => {
    const toast = addToast("Deleting note...", "promise");
    try {
      await axios.delete(`note/${id}`);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.setToastData({
        title: "Note deleted successfully!",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to delete note", isError: true });
    }
  };

  const { editor, setContent } = useUseEditor();

  const updateNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toast = addToast("Updating note...", "promise");
    setIsLoading(true);
    try {
      await axios.put("note/" + editId, {
        title,
        content: editor?.getHTML(),
      });
      setIsNotesModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.setToastData({
        title: "Note updated successfully!",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to update note", isError: true });
    } finally {
      setIsLoading(false);
    }
  };
  const queryClient = useQueryClient();

  const onAnimationEnd = () => {
    console.log("on animation end ran");
    setTitle("");
    setContent("");
    setDefaultValues({});
  };

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Notes</h1>
      <NotesModal
        editor={editor}
        onAnimationEnd={onAnimationEnd}
        setTitle={setTitle}
        title={title}
        updateNoteHandler={updateNoteHandler}
        setIsOpen={setIsNotesModalOpen}
        defaultValues={defaultValues}
        isOpen={isNotesModalOpen}
      />

      <>
        <Search query={query} searchingFor="notes" setQuery={setQuery} />
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Number of notes : {notesCount}
        </h6>

        <Button
          className="py-4 my-6 mr-0 ml-auto bg-blue-600 border-none"
          onClick={() => setIsNotesModalOpen(true)}
        >
          Add new note
        </Button>

        <SelectedItemsController isItemsNotes={true} />

        <div className="grid gap-4 grid-container">
          {notes?.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                setIsNotesModalOpen(true);
                setDefaultValues({ title: note.title });
                setTitle(note.title);
                setEditId(note._id);
                setContent(note.content);
              }}
            >
              <ItemCard
                isNotes={true}
                id={note._id}
                Icon={<StickyNote />}
                name={note.title}
                deleteHandler={deleteNoteHandler}
              />
            </div>
          ))}

          {(isInitialLoading || isFetchingNextPage) && <CollectionSkeleton />}
        </div>
      </>
    </div>
  );
};

export default Notes;

const NotesModal = ({
  setIsOpen,
  isOpen,
  defaultValues,
  title,
  setTitle,
  updateNoteHandler,
  editor,
  onAnimationEnd,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  isOpen: boolean;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  updateNoteHandler: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  editor: Editor | null;
  onAnimationEnd: () => void;
}) => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const createNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("note", {
        title,
        content: editor?.getHTML(),
      });
      response.data;
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      loading={isLoading}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      className="max-w-none"
    >
      <Modal.Header
        title={defaultValues.title ? "Edit This Note" : "Add New Note"}
        setIsOpen={setIsOpen}
      ></Modal.Header>
      <Form
        className="w-[100%] py-0 px-0"
        onSubmit={(e) =>
          defaultValues.title ? updateNoteHandler(e) : createNoteHandler(e)
        }
      >
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Note Name</Form.Label>
            <Form.Input
              value={title}
              type="text"
              name="playlist_name"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <Form.Label>Note Content</Form.Label>
            <TipTapEditor editor={editor} />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsOpen(false)}
              size="parent"
              type="button"
              variant={"danger"}
            >
              Cancel
            </Button>
            <Button size="parent">
              {defaultValues.title ? "Save Changes" : "Add Note"}
            </Button>{" "}
          </div>
        </Modal.Footer>{" "}
      </Form>
    </Modal>
  );
};
