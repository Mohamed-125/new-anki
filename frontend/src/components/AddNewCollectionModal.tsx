import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useRef } from "react";
import Form from "./Form";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import { CollectionType } from "@/hooks/useGetCollections";
import Button from "./Button";
import Modal from "./Modal";
import useModalStates from "@/hooks/useModalsStates";
import useInvalidateCollectionsQueries from "@/hooks/Queries/useInvalidateCollectionsQuery";

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

  const { mutateAsync } = useMutation({
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
    // onError: (
    //   context: undefined | { previousCollections: CollectionType[] }
    // ) => {
    //   if (context) {
    //     const previousCollections = context.previousCollections;
    //     if (previousCollections) {
    //       queryClient.setQueryData(["collections"], (old: CollectionType[]) => [
    //         ...old,
    //         previousCollections,
    //       ]);
    //     }
    //   }
    // },

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
    if (name) {
      const data = {
        name,
        parentCollectionId: parentCollectionId ? parentCollectionId : undefined,
        public: publicCollection !== null,
      };
      mutateAsync(data);
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
        invalidateCollectionsQueries();
        (e.target as HTMLFormElement).reset();
      });
  };
  const formRef = useRef<HTMLFormElement | null>(null);

  const onAnimationEnd = () => {
    formRef.current?.reset();
    setDefaultValues(null);
  };

  return (
    <Modal
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
              className="w-full px-4 py-2 text-gray-900 transition-all border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter collection name"
              required
            />
          </Form.Field>
          <Form.Field className="flex items-center gap-3">
            <div className="relative flex items-center">
              <input
                id="collection_public"
                name="collection_public"
                defaultChecked={defaultValues?.collecitonPublic}
                type="checkbox"
                className="w-5 h-5 text-blue-600 transition-colors border-gray-300 rounded focus:ring-blue-500"
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
        <Modal.Footer className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {defaultValues?.collectionName ? "Save Changes" : "Add Collection"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(AddNewCollectionModal);
