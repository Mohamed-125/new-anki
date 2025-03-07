import { useEffect, useState, useCallback, useRef } from "react";

const useSelection = () => {
  const [selectionData, setSelectionData] = useState<{
    text: string;
  }>({
    text: "",
  });

  const handleSelection = useCallback((e: Event) => {
    const selected = window.getSelection();

    const textDiv = document.querySelector(".text-div");
    const captionsDiv = document.getElementById("captions-div");

    const translationWindow = document.getElementById("translationWindow");

    if (!selected) return;
    if (translationWindow?.contains(selected.anchorNode)) {
      e.preventDefault();
      return;
    }

    if (textDiv) {
      if (!textDiv?.contains(selected.anchorNode)) {
        setSelectionData((prev) => {
          return { text: "" };
        });
        return;
      }
    } else {
      if (!captionsDiv?.contains(selected.anchorNode)) {
        console.log(selected, selected.anchorNode);
        setSelectionData((prev) => {
          return { text: "" };
        });
        return;
      }
    }

    // Update ref (won't trigger re-renders)

    setSelectionData((prev) => {
      return {
        text: selected.toString(),
      };
    });
  }, []);

  const handleSelectionChange = (e: Event) => {
    handleSelection(e);
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    // document.addEventListener("click", removeSelection);

    return () => {
      document?.removeEventListener("selectionchange", handleSelectionChange);
      // document.removeEventListener("click", removeSelection);
    };
  }, [handleSelection]);

  return { selectionData };
};

export default useSelection;
