import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import axios from "axios";
import Form from "../components/Form";
import TipTapEditor from "../components/TipTapEditor";
import Button from "../components/Button";
import useUseEditor from "@/hooks/useUseEditor";
import useToasts from "@/hooks/useToasts";

const AddNewNote = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const id = useParams()?.id;

  const {
    data: note = {},
    error,
    isLoading,
  } = useQuery({
    enabled: !!id,
    queryKey: ["note", id],
    queryFn: async ({ signal }) => {
      const response = await axios.get("note/" + id, { signal });
      return response.data;
    },
  });

  const { editor, setContent } = useUseEditor(false);
  const queryClient = useQueryClient();

  const invalidateNoteQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["note", id] });
  };

  useEffect(() => {
    if (note?.title) setTitle(note?.title);
    if (note?.content) setTimeout(() => setContent(note?.content), 200);
  }, [note]);

  const navigate = useNavigate();
  const { addToast } = useToasts();

  const createNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toast = addToast("Adding note...", "promise");

    try {
      if (title && editor) {
        const data = {
          title,
          content: editor.getHTML(),
        };
        const response = await axios.post(`note/`, data);
        invalidateNoteQueries();
        navigate("/notes/" + response.data._id);
        toast.setToastData({ title: "Note Added!", isCompleted: true });
      }
    } catch (err) {
      toast.setToastData({ title: "Failed to add note", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const updateNoteHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toast = addToast("Updating note...", "promise");

    try {
      const data = {
        title,
        content: editor?.getHTML(),
      };
      const response = await axios.put(`note/${note._id}`, data);
      navigate("/notes/" + response.data._id);
      invalidateNoteQueries();
      toast.setToastData({ title: "Note Updated!", isCompleted: true });
    } catch (err) {
      toast.setToastData({ title: "Failed to update note", isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <Loading />;

  return (
    <Form
      className="text mb-[100px] max-w-[unset] mx-auto rounded-2xl border border-light-gray w-[90%] !px-9 sm:!px-5 !py-14 min-h-screen"
      onSubmit={(e) =>
        note?.title ? updateNoteHandler(e) : createNoteHandler(e)
      }
    >
      <Form.Title>{note?.title ? "Edit This Note" : "Add New Note"}</Form.Title>
      <Form.FieldsContainer className={"min-h-[90vh]"}>
        <Form.Field>
          <Form.Label>Note Name</Form.Label>
          <Form.Input
            value={title}
            type="text"
            required
            name="note_name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Field>

        <Form.Field className={"grow"}>
          <Form.Label>Note Content</Form.Label>
          <TipTapEditor editor={editor} />
        </Form.Field>
      </Form.FieldsContainer>

      <div className="container flex fixed right-0 bottom-0 left-0 gap-2 mt-9 bg-white rounded-md border border-light-gray">
        <Button
          size="parent"
          className={"py-3"}
          type="button"
          variant={"danger"}
          onClick={() => {
            if (note?.title) {
              navigate("/notes/" + id, { replace: true });
            } else {
              navigate("/notes", { replace: true });
            }
          }}
        >
          Cancel
        </Button>
        <Button size="parent" className={"py-3"}>
          {note?.title ? "Save Changes" : "Add Note"}
        </Button>
      </div>
    </Form>
  );
};

export default AddNewNote;
