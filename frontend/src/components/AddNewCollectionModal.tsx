import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef, useState } from "react";
import Form from "./Form";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import { CollectionType } from "@/hooks/useGetCollections";
import Button from "./Button";
import Modal from "./Modal";
import useModalStates from "@/hooks/useModalsStates";
import useInvalidateCollectionsQueries from "@/hooks/Queries/useInvalidateCollectionsQuery";
import useToasts from "@/hooks/useToasts";
import { isError } from "util";

const AddNewCollectionModal = ({}: {}) => {
  const {
    setIsCollectionModalOpen,
    parentCollectionId,
    isCollectionModalOpen,
    editId,
    defaultValues,
    setDefaultValues,
  } = useModalStates();
  const queryClient = useQueryClient();

  const invalidateCollectionsQueries = useInvalidateCollectionsQueries();

  useAddModalShortcuts(setIsCollectionModalOpen, true);
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    onMutate: async (newCollection: Partial<CollectionType>) => {
      // await queryClient.cancelQueries({ queryKey: ["collections"] });
      // const previousCollections = queryClient.getQueryData(["collections"]);
      // // Optimistically update to the new value
      // queryClient.setQueryData(["collections"], (old: CollectionType[]) => {
      //   console.log(old);
      //   return [newCollection, ...old];
      // });
      // // Return a context object with the snapshotted value
      // return { previousCollections } as {
      //   previousCollections: CollectionType[];
      // };
    },
    onError: (
      context: undefined | { previousCollections: CollectionType[] }
    ) => {},

    onSuccess() {
      invalidateCollectionsQueries();
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
    const toast = addToast("Adding Collection...", "promise");
    setIsLoading(true);

    if (name) {
      const data = {
        name,
        parentCollectionId: parentCollectionId ? parentCollectionId : undefined,
        public: publicCollection !== null,
      };

      mutateAsync(data)
        .then(() => {
          toast.setToastData({ title: "Collection Added!", isCompleted: true });
        })
        .catch(() => {
          toast.setToastData({
            title: "Faild To Add Collection",
            isError: true,
          });
        })
        .finally(() => setIsLoading(false));
    }
  };

  const updateCollectionHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("collection_name") as string;
    const publicCollection = formData.get("collection_public") as string;
    const isSubCollection = formData.get("is_sub_collection") as string;

    const data = {
      name,
      parentCollectionId: isSubCollection ? undefined : null,
      public: publicCollection !== null,
    };
    const toast = addToast("Adding Collection...", "promise");

    try {
      await axios.put(`collection/${editId}`, data);
      setIsCollectionModalOpen(false);
      invalidateCollectionsQueries();
      toast.setToastData({ title: "Collection Added!", isCompleted: true });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.setToastData({ title: "Faild To Add Collection", isError: true });
    } finally {
      setIsLoading(false);
    }
  };
  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    console.log("ran");
    formRef.current?.reset();
    setDefaultValues((pre) => {
      return {
        ...pre,
        collectionName: null,
        isCollectionPublic: null,
      };
    });
  };

  return (
    <Modal
      loading={isPending || isLoading}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsCollectionModalOpen}
      isOpen={isCollectionModalOpen}
      className="w-full max-w-lg"
    >
      <Modal.Header
        setIsOpen={setIsCollectionModalOpen}
        title={
          defaultValues?.collectionName
            ? "Edit This Collection"
            : "Add New Collection"
        }
      />
      <Form
        className="p-0 space-y-6"
        formRef={formRef}
        onSubmit={(e) =>
          defaultValues?.collectionName
            ? updateCollectionHandler(e)
            : createCollectionHandler(e)
        }
      >
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Collection Name</Form.Label>
            <Form.Input
              defaultValue={defaultValues?.collectionName}
              type="text"
              name="collection_name"
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter collection name"
              required
            />
          </Form.Field>
          <Form.Field className="flex gap-3 items-center">
            <div className="flex relative items-center">
              <input
                id="collection_public"
                name="collection_public"
                defaultChecked={defaultValues?.isCollectionPublic}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded border-gray-300 transition-colors focus:ring-primary"
              />
              <label
                htmlFor="collection_public"
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Make Collection Public
              </label>
            </div>
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => setIsCollectionModalOpen(false)}
            size="parent"
            type="button"
            variant="danger"
          >
            Cancel
          </Button>
          <Button
            size="parent"
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
          >
            {defaultValues?.collectionName ? "Save Changes" : "Add Collection"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewCollectionModal);
