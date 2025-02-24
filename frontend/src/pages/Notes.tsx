import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import Loading from "../components/Loading";
import axios from "axios";
import Search from "../components/Search";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import Modal from "../components/Modal";
import Form from "../components/Form";
import ReactQuillComponent from "../components/ReactQuillComponent";
import Actions from "../components/ActionsDropdown";
import useModalsStates from "@/hooks/useModalsStates";
import ActionsDropdown from "../components/ActionsDropdown";
import SelectCheckBox from "@/components/SelectCheckBox";
import { StickyNote } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";

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

  const deleteNoteHandler = async (id: string) => {
    setFilteredNotes((pre) => pre.filter((item) => item._id !== id));
    const deleteRes = await axios.delete(`note/${id}`);
  };

  useEffect(() => {
    if (!isNotesModalOpen) {
      setDefaultValues({});
    }
  }, [isNotesModalOpen]);
  if (isLoading) return <Loading />;

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Notes</h1>
      <NotesModal
        setIsOpen={setIsNotesModalOpen}
        defaultValues={defaultValues}
        isOpen={isNotesModalOpen}
        editId={editId}
      />

      {notes?.length ? (
        <>
          <Search
            setState={setFilteredNotes}
            label={"Search your notes"}
            items={notes}
            filter={"title"}
          />

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
            {filteredNotes.map((note) => (
              <ItemCard
                id={note._id}
                Icon={<StickyNote />}
                name={note.title}
                deleteHandler={deleteNoteHandler}
              />
            ))}
          </div>
          <Search.NotFound
            state={filteredNotes}
            searchFor={"notes"}
            filter={"title"}
          />
        </>
      ) : (
        <Button onClick={() => setIsNotesModalOpen(true)}>
          No notes found. Click here to add new Video
        </Button>
      )}
    </div>
  );
};

export default Notes;

const NotesModal = ({
  setIsOpen,
  isOpen,
  defaultValues,
  editId,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  editId: string;
  isOpen: boolean;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const queryClient = useQueryClient();

  const createNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post("note", {
      title,
      content,
    });
    response.data;
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const updateNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.put("note/" + editId, {
      title,
      content,
    });
    response.data;
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  useEffect(() => {
    if (defaultValues.noteContent) {
      setContent(defaultValues.noteContent);
    }
    if (defaultValues.noteTitle) {
      setTitle(defaultValues.noteTitle);
    }
  }, [defaultValues.noteContent, defaultValues.noteTitle]);

  return (
    <Modal
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      className="px-5 py-0 max-w-[unset]"
    >
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={(e) =>
          defaultValues?.noteTitle ? updateNoteHandler(e) : createNoteHandler(e)
        }
      >
        <Form.Title>
          {defaultValues?.noteTitle ? "Edit This Note" : "Add New Note"}
        </Form.Title>
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
            <ReactQuillComponent setContent={setContent} content={content} />
          </Form.Field>
        </Form.FieldsContainer>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsOpen(false)}
            size="parent"
            type="button"
            variant={"danger"}
            className={"mt-8"}
          >
            Cancel
          </Button>
          <Button size="parent" className={"mt-8"}>
            {defaultValues?.noteTitle ? "Save Changes" : "Add Note"}
          </Button>{" "}
        </div>
      </Form>
    </Modal>
  );
};
