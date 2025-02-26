import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import axios from "axios";
import Form from "../components/Form";
import TipTapEditor from "../components/TipTapEditor";
import Button from "../components/Button";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import useUseEditor from "@/hooks/useUseEditor";

const AddNewText = () => {
  const [title, setTitle] = useState("");

  const id = useParams()?.id;

  const {
    data: text = {},
    error,
    isLoading,
  } = useQuery({
    enabled: !!id,
    queryKey: ["text", id],
    queryFn: async () => {
      const response = await axios.get("text/" + id);
      return response.data;
    },
  });

  console.log(text);
  const queryClient = useQueryClient();

  const invalidateTextQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["texts"] });
    queryClient.invalidateQueries({ queryKey: ["text"] });
  };

  const { editor, setContent } = useUseEditor();

  useEffect(() => {
    setTitle(text?.title);
    setTimeout(() => setContent(text?.content), 200);
  }, [text]);

  const navigate = useNavigate();

  const createTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (title && editor) {
      const data = {
        title,
        content: editor.getHTML(),
        // defaultTextId,
      };

      axios
        .post(`text/${editId}`, data)
        .then((res) => {})
        .catch((err) => err)
        .finally(() => {
          invalidateTextQueries();
          (e.target as HTMLFormElement).reset();
        });

      mutateAsync(data).then((text) => navigate("/text/" + text._id));
    }
  };

  const updateTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      title,
      content: editor?.getHTML(),
      //   defaultTextId,
    };

    axios
      .put(`text/${editId}`, data)
      .then((res) => {})
      .catch((err) => err)
      .finally(() => {
        invalidateTextQueries();
        (e.target as HTMLFormElement).reset();
      });
  };

  useEffect(() => {
    if (text.content) {
      setContent(text.content);
    }
    if (text.title) {
      setTitle(text.title);
    }
  }, [text]);

  if (isLoading) return <Loading />;
  return (
    <>
      <MoveCollectionModal text={true} />
      <AddNewCollectionModal />
      <Form
        className=" max-w-[unset] w-[90%]   mt-14 !px-9 sm:!px-5 !py-14 mb-6  rounded-lg min-h-screen"
        onSubmit={(e) =>
          text?.title ? updateTextHandler(e) : createTextHandler(e)
        }
      >
        <Form.Title>
          {text?.title ? "Edit This Text" : "Add New Text"}
        </Form.Title>
        <Form.FieldsContainer className={"min-h-[90vh]"}>
          <Form.Field>
            <Form.Label>Text Name</Form.Label>
            <Form.Input
              value={title}
              type="text"
              name="text_name"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Field>

          <Form.Field className={"grow"}>
            <Form.Label>Text Content</Form.Label>
            <TipTapEditor editor={editor} />
          </Form.Field>
        </Form.FieldsContainer>

        <div className="flex gap-2 mt-9">
          <Button
            size="parent"
            className={"py-3"}
            type="button"
            variant={"danger"}
            onClick={() => {
              if (text?.title) {
                navigate("/myTexts/" + id, { replace: true });
              } else {
                navigate("/myTexts", { replace: true });
              }
            }}
          >
            Cancel
          </Button>
          <Button size="parent" className={"py-3"}>
            {text?.title ? "Save Changes" : "Add Text"}
          </Button>{" "}
        </div>
      </Form>{" "}
    </>
  );
};

export default AddNewText;
