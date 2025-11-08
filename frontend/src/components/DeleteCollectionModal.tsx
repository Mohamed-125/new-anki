import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import useModalsStates from "@/hooks/useModalsStates";

const DeleteCollectionModal = () => {
  const {
    isDeleteCollectionModalOpen,
    setIsDeleteCollectionModalOpen,
    deleteCollectionModalData,
    setDeleteCollectionModalData,
  } = useModalsStates();

  const [deleteCards, setDeleteCards] = useState(
    deleteCollectionModalData?.showCardsInHome === false
  );

  React.useEffect(() => {
    setDeleteCards(deleteCollectionModalData?.showCardsInHome === false);
  }, [deleteCollectionModalData]);

  const handleClose = () => {
    setIsDeleteCollectionModalOpen(false);
    setDeleteCollectionModalData(null);
  };

  const handleConfirm = () => {
    // This will be wired to the delete handler in Collection.tsx
    if (deleteCollectionModalData) {
      window.dispatchEvent(
        new CustomEvent("confirmDeleteCollection", {
          detail: {
            id: deleteCollectionModalData.id,
            deleteCards,
          },
        })
      );
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={isDeleteCollectionModalOpen}
      setIsOpen={setIsDeleteCollectionModalOpen}
      className="w-full max-w-lg md:max-w-none"
    >
      <Modal.Header
        setIsOpen={setIsDeleteCollectionModalOpen}
        title="Delete Collection"
      />
      <div className="p-6">
        <p className="mb-4 text-lg font-medium text-gray-800">
          Are you sure you want to delete this collection?
        </p>
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="delete-cards-checkbox"
            checked={deleteCards}
            onChange={() => setDeleteCards((prev) => !prev)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 transition-colors focus:ring-primary"
          />
          <label
            htmlFor="delete-cards-checkbox"
            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
          >
            Delete cards along with the collection
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleClose} size="parent" type="button" variant="danger">
            Cancel
          </Button>
          <Button onClick={handleConfirm} size="parent" type="button" variant="primary">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCollectionModal;