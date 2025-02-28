import AddCardModal from "./AddCardModal";
import AddNewCollectionModal from "./AddNewCollectionModal";
import MoveCollectionModal from "./MoveCollectionModal";
import SelectedItemsController from "./SelectedItemsController";

const CardsAndCollectionModals = ({
  isMoveToCollectionOpen,
  setIsMoveToCollectionOpen,
  editId,
  setEditId,
  toMoveCollectionId,
  setParentCollectionId,
  setSelectedItems,
  selectedItems,
  isCollectionModalOpen,
  setIsCollectionModalOpen,
  setDefaultValues,
  defaultValues,
  parentCollectionId,
  isItemsCollections,
  isAddCardModalOpen,
  setIsAddCardModalOpen,
  content,
  setContent,
  targetCollectionId,
}) => {
  return (
    <>
      {isAddCardModalOpen && (
        <AddCardModal
          setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
          isAddCardModalOpen={isAddCardModalOpen}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
          defaultValues={defaultValues}
          content={content}
          setDefaultValues={setDefaultValues}
          setContent={setContent}
          setEditId={setEditId}
          editId={editId}
          targetCollectionId={targetCollectionId}
          isMoveToCollectionOpen={isMoveToCollectionOpen}
        />
      )}
      <MoveCollectionModal
        isMoveToCollectionOpen={isMoveToCollectionOpen}
        setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
        editId={editId}
        setEditId={setEditId}
        toMoveCollectionId={toMoveCollectionId}
        setParentCollectionId={setParentCollectionId}
        setSelectedItems={setSelectedItems}
        selectedItems={selectedItems}
        isCollectionModalOpen={isCollectionModalOpen}
        setisCollectionModalOpen={setIsCollectionModalOpen}
      />
      <AddNewCollectionModal
        setDefaultValues={setDefaultValues}
        setIsCollectionModalOpen={setIsCollectionModalOpen}
        isCollectionModalOpen={isCollectionModalOpen}
        defaultValues={defaultValues}
        parentCollectionId={parentCollectionId}
        editId={editId}
      />
      {selectedItems.length > 0 && (
        <SelectedItemsController
          selectedItems={selectedItems}
          setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
          setSelectedItems={setSelectedItems}
          isItemsCollections={isItemsCollections}
        />
      )}
    </>
  );
};

export default CardsAndCollectionModals;
