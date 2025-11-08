import { CollectionType } from "@/hooks/useGetCollections";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { boolean } from "zod";

type StatesType = {
  isMoveToCollectionOpen: boolean;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;

  editId: string;
  setEditId: React.Dispatch<React.SetStateAction<string>>;

  toMoveCollection: CollectionType | undefined;
  setToMoveCollection: React.Dispatch<
    React.SetStateAction<CollectionType | undefined>
  >;

  parentCollectionId: string;
  setParentCollectionId: React.Dispatch<React.SetStateAction<string>>;

  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;

  isCollectionModalOpen: boolean;
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isShareModalOpen: boolean;
  setIsShareModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shareItemId: string;
  setShareItemId: React.Dispatch<React.SetStateAction<string>>;
  shareItemName: string;
  setShareItemName: React.Dispatch<React.SetStateAction<string>>;

  defaultValues: Record<string, any> | null;
  setDefaultValues: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
  isItemsCollections: boolean;
  setIsItemsCollections: React.Dispatch<React.SetStateAction<boolean>>;

  setIsVideoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isVideoModalOpen: boolean;

  setIsTextModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTextModalOpen: boolean;

  isAddCardModalOpen: boolean;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;

  targetCollectionId: string;
  setTargetCollectionId: React.Dispatch<React.SetStateAction<string>>;

  setIsTranslationBoxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTranslationBoxOpen: boolean;
  isDeleteCollectionModalOpen: boolean;
  setIsDeleteCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteCollectionModalData: { id: string; showCardsInHome: boolean } | null;
  setDeleteCollectionModalData: React.Dispatch<
    React.SetStateAction<{ id: string; showCardsInHome: boolean } | null>
  >;
};

export const statesContext = createContext<StatesType | null>(null);

const StatesContext = ({ children }: { children: ReactNode }) => {
  // used To open the move collection modal
  const [isMoveToCollectionOpen, setIsMoveToCollectionOpen] = useState(false);
  // used in cards and collection to set the edit it in patch requests
  const [editId, setEditId] = useState("");
  // the collection chosesn to move in the move collection modal
  const [toMoveCollection, setToMoveCollection] = useState<
    CollectionType | undefined
  >();
  // sets the parent collection when when editing moving collections
  const [parentCollectionId, setParentCollectionId] = useState("");
  // state to select many card,collection, etc.
  // Using localStorage to persist selection state across pagination
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    const savedItems = localStorage.getItem("selectedItems");
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // Update localStorage when selectedItems changes
  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  }, [selectedItems]);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Record<
    string,
    any
  > | null>(null);
  const [isItemsCollections, setIsItemsCollections] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  // card content
  const [content, setContent] = useState("");
  // the collection to move to
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const [shareItemId, setShareItemId] = useState("");
  const [shareItemName, setShareItemName] = useState("");

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTranslationBoxOpen, setIsTranslationBoxOpen] = useState(false);
  const [deleteCollectionModalData, setDeleteCollectionModalData] = useState<{
    showCardsInHome: boolean;
    id: string;
  } | null>({ showCardsInHome: true, id: "" });
  const [isDeleteCollectionModalOpen, setIsDeleteCollectionModalOpen] =
    useState(false);

  useEffect(() => {
    if (selectedItems.length) {
      document.body.style.marginBottom = `40px`;
    }
  }, [selectedItems]);
  return (
    <statesContext.Provider
      value={{
        isShareModalOpen,
        setIsShareModalOpen,
        shareItemId,
        setShareItemId,
        shareItemName,
        setShareItemName,
        isMoveToCollectionOpen,
        setIsMoveToCollectionOpen,
        editId,
        setEditId,
        toMoveCollection,
        setToMoveCollection,
        parentCollectionId,
        setParentCollectionId,
        selectedItems,
        setSelectedItems,
        isCollectionModalOpen,
        setIsCollectionModalOpen,
        defaultValues,
        setDefaultValues,
        isItemsCollections,
        setIsItemsCollections,
        isAddCardModalOpen,
        setIsAddCardModalOpen,
        content,
        setContent,
        targetCollectionId,
        setTargetCollectionId,
        setIsVideoModalOpen,
        isVideoModalOpen,
        setIsTextModalOpen,
        isTextModalOpen,
        isTranslationBoxOpen,
        setIsTranslationBoxOpen,
        isDeleteCollectionModalOpen,
        setIsDeleteCollectionModalOpen,
        deleteCollectionModalData,
        setDeleteCollectionModalData,
      }}
    >
      {children}
    </statesContext.Provider>
  );
};

export default StatesContext;
