import axios from "axios";
import Collection from "../components/Collection";
import React, { FormEvent, useEffect, useState } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Form from "../components/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import useGetCollections, { CollectionType } from "../hooks/useGetCollections";
import Loading from "../components/Loading";

const Collections = () => {
  const { data: collections, isLoading } = useGetCollections() as {
    data: CollectionType[];
    isLoading: boolean;
  };
  const [isCollectionsModalOpen, setIsCollectionModalOpen] = useState(false);
  // const [collectionCards, setCollectionsCards] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionType[]
  >(collections || []);

  const [acionsDivId, setActionsDivId] = useState("");

  console.log(collections);

  // the mutation logic for adding a collection and optimistic updates
  const queryClient = useQueryClient();

  const deleteCollectionHandler = (collectionId: string) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        queryClient.invalidateQueries(["collections"] as any);
      })
      .catch((err) => err);
  };

  useEffect(() => {
    if (!isCollectionsModalOpen) {
      ("tsrtarstr");
      setDefaultValues({});
    }
  }, [isCollectionsModalOpen]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [changeItemsParent, setChangeItemsParent] = useState(false);

  if (isLoading || !collections) {
    return <Loading />;
  }
  return (
    <div className="container">
      <AddNewCollectionModal
        setIsCollectionModalOpen={setIsCollectionModalOpen}
        isCollectionsModalOpen={isCollectionsModalOpen}
        defaultValues={defaultValues}
        editId={editId}
      />

      {collections?.length ? (
        <div>
          <Search
            setState={setFilteredCollections}
            label={"Search your collections"}
            items={collections}
            filter={"name"}
          />

          <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isItemsCollections={true}
          />

          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
            onClick={() => setIsCollectionModalOpen(true)}
          >
            Create new collection
          </Button>

          {/* <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isItemsCollections={true}
          /> */}

          <div className="grid gap-2 grid-container">
            {filteredCollections.map((collection) => (
              <Collection
                collection={collection}
                key={collection._id}
                defaultValues={defaultValues}
                deleteHandler={deleteCollectionHandler}
                setDefaultValues={setDefaultValues}
                setIsCollectionModalOpen={setIsCollectionModalOpen}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                setEditId={setEditId}
                setActionsDivId={setActionsDivId}
                isActionDivOpen={acionsDivId === collection._id}
              />
            ))}{" "}
          </div>

          <Search.NotFound
            state={filteredCollections}
            searchFor={"collection"}
            filter={"name"}
          />
        </div>
      ) : (
        <Button
          className="mt-11"
          size="fit"
          center={true}
          onClick={() => setIsCollectionModalOpen(true)}
        >
          There is not collections Create Your First Now{" "}
        </Button>
      )}
    </div>
  );
};

export default Collections;

const AddNewCollectionModal = ({
  isCollectionsModalOpen,
  setIsCollectionModalOpen,
  defaultValues,
  editId,
}: {
  isCollectionsModalOpen: boolean;
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues: any;
  editId: string;
}) => {
  const queryClient = useQueryClient();

  const { mutate, data } = useMutation({
    onMutate: async (newCollection: Partial<CollectionType>) => {
      await queryClient.cancelQueries({ queryKey: ["collections"] });

      const previousCollections = queryClient.getQueryData(["collections"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["collections"], (old: CollectionType[]) => [
        ...old,
        newCollection,
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

    const data = {
      name,
      public: publicCollection !== null,
    };

    axios
      .put(`collection/${editId}`, data)
      .then((res) => {
        queryClient.invalidateQueries(["collections"] as any);
      })
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

          <Form.Field className="flex items-center gap-2">
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
