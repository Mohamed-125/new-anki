import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import axios from "axios";
import Form from "../components/Form";
import ReactQuillComponent from "../components/ReactQuillComponent";
import Button from "../components/Button";

const AddNewText = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const createTextHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post("text", {
      title,
      content,
    });

    response.data;

    //@ts-ignore
    navigate("/myTexts/" + response.data._id, {
      replace: true,
    });
  };

  const updateTextHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.put("text/" + id, {
      title,
      content,
    });
    response.data;
    queryClient.invalidateQueries({ queryKey: ["texts"] });
    navigate("/myTexts/" + id, {
      replace: true,
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
    <Form
      className=" max-w-[unset] w-[90%] container mt-14 !px-9 sm:!px-5 !py-14 mb-6  rounded-lg min-h-screen"
      onSubmit={(e) =>
        text?.title ? updateTextHandler(e) : createTextHandler(e)
      }
    >
      <Form.Title>{text?.title ? "Edit This Text" : "Add New Text"}</Form.Title>
      <Form.FieldsContainer className={"min-h-[90vh]"}>
        <Form.Field>
          <Form.Label>Text Name</Form.Label>
          <Form.Input
            value={title}
            type="text"
            name="playlist_name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Field>

        <Form.Field className={"grow"}>
          <Form.Label>Text Content</Form.Label>
          <ReactQuillComponent
            className={"text"}
            setContent={setContent}
            content={content}
          />
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
    </Form>
  );
};

export default AddNewText;
