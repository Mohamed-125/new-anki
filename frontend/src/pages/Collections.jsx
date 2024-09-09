import axios from "axios";
import Collection from "../components/Collection";
import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import Form from "../components/Form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { set } from "mongoose";
import Search from "../components/Search";

const Collections = () => {
  const [isCollectionsModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionCards, setCollectionsCards] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [acionsDivId, setActionsDivId] = useState("");

  const {
    data: collections,
    isLoading: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: () => axios.get("collection").then((res) => res.data),
  });

  useEffect(() => {
    console.log(collections);
  }, [collections]);

  if (isLoading) <Loading />;

  // the mutation logic for adding a collection and optimistic updates

  const queryClient = useQueryClient();

  const { mutate, data } = useMutation({
    onMutate: async (newCollection) => {
      await queryClient.cancelQueries({ queryKey: ["collections"] });

      const previousCollections = queryClient.getQueryData(["collections"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["collections"], (old) => [
        ...old,
        newCollection,
      ]);

      // Return a context object with the snapshotted value
      return { previousCollections };
    },
    onError: (error, data, { previousCollections }) => {
      queryClient.setQueryData(["collections"], (old) => [
        ...old,
        previousCollections,
      ]);
    },

    mutationFn: (data) => {
      return axios.post("collection", data).then((res) => {
        console.log("new collection created !!!", res.data);
        return res.data;
      });
    },
  });

  const createCollectionHandler = (e, setCollections) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("collection_name"),
      collectionCards,
    };
    mutate(data);
  };

  const updateCollectionHandler = (e, setCollections) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("collection_name"),
      collectionCards,
    };
    axios
      .put(`collection/${editId}`, data)
      .then((res) => {
        queryClient.invalidateQueries(["collections"]);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setIsCollectionModalOpen(false);
      });
  };

  const deleteCollectionHandler = (collectionId) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        console.log("collection deleted !!!", res.data);
        queryClient.invalidateQueries(["collections"]);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!isCollectionsModalOpen) {
      setDefaultValues({});
    }
  }, [isCollectionsModalOpen]);

  return (
    <div>
      {isCollectionsModalOpen ? (
        <Modal
          setIsOpen={setIsCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
        >
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
                ? "edit This Collection"
                : "Add New Collection"}
            </Form.Title>
            <Form.Field>
              <Form.Label>Collection Name</Form.Label>
              <Form.Input
                defaultValue={defaultValues?.collectionName}
                type="text"
                name="collection_name"
              />
            </Form.Field>

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
                {defaultValues?.collectionName ? "Save Changes" : "Add Card"}
              </Button>{" "}
            </div>
          </Form>
        </Modal>
      ) : null}

      {collections?.length ? (
        <div className="container">
          <Search
            setState={setFilteredCollections}
            label={"Search your collections"}
            items={collections}
            filter={"name"}
          />

          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
            onClick={() => setIsCollectionModalOpen(true)}
          >
            Create new collection
          </Button>
          <div className="grid gap-2 grid-container">
            {filteredCollections.map((collection) => (
              <Collection
                collectionId={collection._id}
                slug={collection.slug}
                name={collection.name}
                key={collection._id}
                id={collection._id}
                defaultValues={defaultValues}
                updateHandler={updateCollectionHandler}
                deleteHandler={deleteCollectionHandler}
                setDefaultValues={setDefaultValues}
                setIsCollectionModalOpen={setIsCollectionModalOpen}
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
          onClick={() => setIsCollectionModalOpen(true)}
        >
          There is not collections Create Your First Now{" "}
        </Button>
      )}
    </div>
  );
};

export default Collections;
