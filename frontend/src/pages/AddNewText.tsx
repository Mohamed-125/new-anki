import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import axios from "axios";
import Form from "../components/Form";
import TipTapEditor from "../components/TipTapEditor";
import Button from "../components/Button";
import AddNewCollectionModal from "@/components/AddNewCollectionModal";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import useUseEditor from "@/hooks/useUseEditor";
import { IoClose } from "react-icons/io5";
import useModalsStates from "@/hooks/useModalsStates";
import useGetCollectionById from "@/hooks/useGetCollectionById";
import useToasts from "@/hooks/useToasts";

const AddNewText = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const id = useParams()?.id;
  const { state } = useLocation();
  const topicId = state?.topicId;

  console.log("topicId", topicId, "state", state);

  const {
    data: text = {},
    error,
    isLoading,
  } = useQuery({
    enabled: !!id,
    queryKey: ["text", id],
    queryFn: async ({ signal }) => {
      const response = await axios.get("text/" + id, { signal });
      return response.data;
    },
  });

  const { editor, setContent } = useUseEditor();
  const queryClient = useQueryClient();

  const invalidateTextQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["texts"] });
    queryClient.invalidateQueries({ queryKey: ["text", id] });
  };

  useEffect(() => {
    if (text?.title) setTitle(text?.title);
    if (text?.content) setTimeout(() => setContent(text?.content), 200);
    if (text?.defaultCollectionId)
      setDefaultValues((pre) => {
        return {
          ...pre,
          defaultCollectionId: text.defaultCollectionId || null,
        };
      });
  }, [text]);

  const navigate = useNavigate();
  const { addToast, setToasts } = useToasts();
  const createTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (title && editor) {
      const data = {
        title,
        content: editor.getHTML(),
        topicId,
        defaultCollectionId: defaultValues?.defaultCollectionId,
      };

      const toast = addToast("Adding Text...", "promise");

      axios
        .post(`text/`, data)
        .then((res) => {
          invalidateTextQueries();
          if (topicId) {
            navigate("/admin/topics/" + topicId, { replace: true });
          } else {
            navigate("/texts/" + res.data._id);
          }
          toast.setToastData({
            title: "Text Added!",
            isCompleted: true,
            type: "success",
          });
        })
        .catch((err) => err);
    }
  };

  const updateTextHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title,
      content: editor?.getHTML(),
      defaultCollectionId: defaultValues?.defaultCollectionId,
    };

    const toast = addToast("Updating Text...", "promise");
    axios
      .patch(`text/${text._id}`, data)
      .then((res) => {
        if (topicId) {
          navigate("/admin/topics/" + topicId, { replace: true });
        } else {
          navigate("/texts/" + res.data._id);
        }
        invalidateTextQueries();
        toast.setToastData({
          title: "Text Updated!",
          isCompleted: true,
          type: "success",
        });
      })
      .catch((err) => err);
  };
  const { setIsMoveToCollectionOpen, defaultValues, setDefaultValues } =
    useModalsStates();

  useEffect(() => {
    if (text.content) {
      setContent(text.content);
    }
    if (text.title) {
      setTitle(text.title);
    }
    if (text?.defaultCollectionId) {
      setDefaultValues((pre) => {
        return { ...pre, defaultCollectionId: text.defaultCollectionId };
      });
    }
  }, [text]);

  const { collection } = useGetCollectionById(
    defaultValues?.defaultCollectionId
  );

  if (isLoading || loading) return <Loading />;
  return (
    <>
      <MoveCollectionModal text={true} />
      <AddNewCollectionModal />
      <Form
        className="text mb-[100px] max-w-[unset] mx-auto rounded-2xl border border-light-gray w-[90%] !px-9 sm:!px-5 !py-14  min-h-screen"
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
              required
              name="text_name"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Field>
          {!topicId && (
            <Form.Field>
              <Form.Label>
                {collection?.name && (
                  <span className="flex gap-2 items-center">
                    Default Collection
                    {"" + " : " + collection?.name}
                    <Button
                      onClick={() => {
                        setDefaultValues({ defaultCollectionId: null });
                      }}
                      variant="danger"
                      className="grid w-6 h-6 transition-colors !p-0 duration-200 rounded-full place-items-center hover:bg-red-400"
                    >
                      <IoClose className="text-[18px] font-medium" />
                    </Button>{" "}
                  </span>
                )}
              </Form.Label>
              <Button
                type="button"
                onClick={() => {
                  setIsMoveToCollectionOpen(true);
                }}
              >
                Choose Default Collection
              </Button>
            </Form.Field>
          )}
          <Form.Field className={"grow"}>
            <Form.Label>Text Content</Form.Label>
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
              if (text?.title) {
                if (topicId) {
                  navigate("/admin/topics/" + topicId, { replace: true });
                } else {
                  navigate("/texts/" + id, { replace: true });
                }
              } else {
                if (topicId) {
                  navigate("/admin/topics/" + topicId, { replace: true });
                } else {
                  navigate("/texts/", { replace: true });
                }
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
