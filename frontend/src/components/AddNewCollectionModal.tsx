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
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useCollectionActions from "@/hooks/useCollectionActions";

const AddNewCollectionModal = ({
  onCollectionCreated,
}: {
  onCollectionCreated?: (cardId: string) => Promise<void>;
}) => {
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

  const [isMutationLoading, setIsMutationLoading] = useState(false);

  const { selectedLearningLanguage } = useGetCurrentUser();

  const handleCreateCollection = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("collection_name") as string;

    const publicCollection = formData.get("collection_public") as string;
    // REMOVED: setIsLoading(true);
    // REMOVED: setIsMutationLoading(true);

    if (name) {
      const data = {
        name,
        parentCollectionId: parentCollectionId ? parentCollectionId : undefined,
        public: publicCollection !== null,
        showCardsInHome: formData.get("show_cards_home") !== null,
        language: selectedLearningLanguage,
        sectionId: defaultValues?.sectionId || null,
      };

      createCollectionHandler(data)
        .then((res) => {
          onCollectionCreated && onCollectionCreated(res._id);
          setIsCollectionModalOpen(false);
        })
        .catch((error) => {
          console.error("Error creating collection:", error);
        });
        // Removed isLoading and isMutationLoading states and loading prop from Modal. Modal now closes immediately after add/edit.
    }
  };

  const { updateCollectionHandler: updateCollection, createCollectionHandler } = useCollectionActions();

  const updateCollectionHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // REMOVED: setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("collection_name") as string;
    const publicCollection = formData.get("collection_public") as string;
    const isSubCollection = formData.get("is_sub_collection") as string;

    try {
      await updateCollection({
        id: editId!,
        name,
        isPublic: publicCollection !== null,
        showCardsInHome: formData.get("show_cards_home") !== null,
        sectionId: defaultValues?.sectionId,
      });
      setIsCollectionModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    }
    // REMOVED: finally block for loading states
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

  console.log(
    defaultValues?.collectionShowCardsInHome === undefined ||
      defaultValues?.collectionShowCardsInHome === null
      ? true
      : defaultValues.collectionShowCardsInHome
  );

  return (
    <Modal
      // REMOVED: loading={isMutationLoading || isLoading}
      onAnimationEnd={onAnimationEnd}
      setIsOpen={setIsCollectionModalOpen}
      isOpen={isCollectionModalOpen}
      className="w-full max-w-lg md:max-w-none"
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
            : handleCreateCollection(e)
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
          <div className="space-y-3">
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
            <Form.Field className="flex gap-3 items-center">
              <div className="flex relative items-center">
                <input
                  id="show_cards_home"
                  name="show_cards_home"
                  defaultChecked={defaultValues?.collectionShowCardsInHome}
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 transition-colors focus:ring-primary"
                />
                <label
                  htmlFor="show_cards_home"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Show Cards in Home Page
                </label>
              </div>
            </Form.Field>
          </div>
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
