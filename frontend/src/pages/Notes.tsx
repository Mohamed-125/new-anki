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

type NoteType = {
  title: string;
  content: string;
  _id: string;
};
const Notes = () => {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await axios.get("note");
      return response.data;
    },
  });
  const [filteredNotes, setFilteredNotes] = useState<NoteType[]>([]);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [title, setTitle] = useState("");

  const deleteNoteHandler = async (id: string) => {
    setFilteredNotes((pre) => pre.filter((item) => item._id !== id));
    const deleteRes = await axios.delete(`note/${id}`);
  };

  const { editor, setContent } = useUseEditor();

  const updateNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.put("note/" + editId, {
      title,
      content: editor?.getHTML(),
    });
    setIsNotesModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };
  const queryClient = useQueryClient();

  const onAnimationEnd = () => {
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
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Number of notes : {notes?.length}
        </h6>

        <Button
          className="py-4 my-6 ml-auto mr-0 bg-blue-600 border-none "
          onClick={() => setIsNotesModalOpen(true)}
        >
          Add new note
        </Button>

        <SelectedItemsController isItemsNotes={true} />

        <div className="grid gap-4 grid-container">
          {notes?.map((note: NoteType) => (
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

          {isLoading && <CollectionSkeleton />}
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

  const createNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post("note", {
      title,
      content: editor?.getHTML(),
    });
    response.data;
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  return (
    <Modal
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
