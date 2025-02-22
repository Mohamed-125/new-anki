import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent } from "react";
import Form from "./Form";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import { CollectionType } from "../context/CollectionsContext";
import Button from "./Button";
import Modal from "./Modal";

const AddNewCollectionModal = ({
  isCollectionsModalOpen,
  setIsCollectionModalOpen,
  defaultValues,
  editId,
  parentCollectionId,
}: {
  isCollectionsModalOpen: boolean;
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  editId: string;
  parentCollectionId?: string;
}) => {
  const queryClient = useQueryClient();
  useAddModalShortcuts(setIsCollectionModalOpen, true);

  const { mutate, data } = useMutation({
    onMutate: async (newCollection: Partial<CollectionType>) => {
      await queryClient.cancelQueries({ queryKey: ["collections"] });

      const previousCollections = queryClient.getQueryData(["collections"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["collections"], (old: CollectionType[]) => [
        newCollection,
        ...old,
      ]);

      // Return a context object with the snapshotted value
      return { previousCollections } as {
        previousCollections: CollectionType[];
      };
    },
    onError: (
      error,
      data,
      context: undefined | { previousCollections: CollectionType[] }
    ) => {
      if (context) {
        const previousCollections = context.previousCollections;
        if (previousCollections) {
          queryClient.setQueryData(["collections"], (old: CollectionType[]) => [
            ...old,
            previousCollections,
          ]);
        }
      }
    },

    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection", parentCollectionId],
      });
      queryClient.refetchQueries({ queryKey: ["collections"] });
      queryClient.refetchQueries({
        queryKey: ["collection", parentCollectionId],
      });

      setIsCollectionModalOpen(false);
    },
    mutationFn: async (data) => {
      return await axios.post("collection", data).then((res) => {
        return res.data;
      });
    },
  });

  const createCollectionHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("collection_name") as string;

    const publicCollection = formData.get("collection_public") as string;
    if (name) {
      const data = {
        name,
        parentCollectionId: parentCollectionId ? parentCollectionId : undefined,
        public: publicCollection !== null,
      };
      //@ts-ignore
      mutate(data);
    }
  };

  const updateCollectionHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("collection_name") as string;
    const publicCollection = formData.get("collection_public") as string;
    const isSubCollection = formData.get("is_sub_collection") as string;

    const data = {
      name,
      parentCollectionId: isSubCollection ? undefined : null,
      public: publicCollection !== null,
    };

    axios
      .put(`collection/${editId}`, data)
      .then((res) => {})
      .catch((err) => err)
      .finally(() => {
        setIsCollectionModalOpen(false);
      });
  };

  return (
    <Modal setIsOpen={setIsCollectionModalOpen} isOpen={isCollectionsModalOpen}>
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={(e) =>
          defaultValues?.collectionName
            ? updateCollectionHandler(e)
            : createCollectionHandler(e)
        }
      >
        <Form.Title>
          {defaultValues?.collectionName
            ? "Edit This Collection"
            : "Add New Collection"}
        </Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Collection Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.collectionName}
              type="text"
              name="collection_name"
            />
          </Form.Field>

          <Form.Field className="flex gap-2 items-center">
            <label>Collection Public</label>
            <input
              name="collection_public"
              defaultValue={defaultValues?.collecitonPublic}
              type="checkbox"
            />
          </Form.Field>
        </Form.FieldsContainer>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsCollectionModalOpen(false)}
            size="parent"
            type="button"
            variant={"danger"}
            className={"mt-8"}
          >
            Cancel
          </Button>
          <Button size="parent" className={"mt-8"}>
            {defaultValues?.collectionName ? "Save Changes" : "Add Collection"}
          </Button>{" "}
        </div>
      </Form>
    </Modal>
  );
};

export default AddNewCollectionModal;
