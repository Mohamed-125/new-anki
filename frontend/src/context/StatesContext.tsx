import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type StatesType = {
  isMoveToCollectionOpen: boolean;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;

  editId: string;
  setEditId: React.Dispatch<React.SetStateAction<string>>;

  toMoveCollectionId: string;
  setToMoveCollectionId: React.Dispatch<React.SetStateAction<string>>;

  parentCollectionId: string;
  setParentCollectionId: React.Dispatch<React.SetStateAction<string>>;

  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;

  isCollectionModalOpen: boolean;
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
};

export const statesContext = createContext<StatesType | null>(null);

const StatesContext = ({ children }: { children: ReactNode }) => {
  // used To open the move collection modal
  const [isMoveToCollectionOpen, setIsMoveToCollectionOpen] = useState(false);
  // used in cards and collection to set the edit it in put requests
  const [editId, setEditId] = useState("");
  // the collection chosesn to move in the move collection modal
  const [toMoveCollectionId, setToMoveCollectionId] = useState("");
  // sets the parent collection when when editing moving collections
  const [parentCollectionId, setParentCollectionId] = useState("");
  // state to select many card,collection, etc.
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  return (
    <statesContext.Provider
      value={{
        isMoveToCollectionOpen,
        setIsMoveToCollectionOpen,
        editId,
        setEditId,
        toMoveCollectionId,
        setToMoveCollectionId,
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
      }}
    >
      {children}
    </statesContext.Provider>
  );
};

export default StatesContext;
