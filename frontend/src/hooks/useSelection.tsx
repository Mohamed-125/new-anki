import { useEffect, useState, useCallback, useRef } from "react";
import useModalsStates from "./useModalsStates";

const useSelection = (delay: number = 400) => {
  const [selectionData, setSelectionData] = useState<{
    text: string;
    selection?: Selection | null;
  }>({
    text: "",
    selection: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const { setIsTranslationBoxOpen, isTranslationBoxOpen } = useModalsStates();

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

    // Check if this is a click (anchorOffset is 0 and focusOffset is 1) or a drag selection
    const isClickSelection =
      selected.anchorNode === selected.focusNode &&
      selected.anchorOffset === 0 &&
      selected.focusOffset === 1;

    // Only close translation box if it's a drag selection and not inside translation window
    if (
      !isClickSelection &&
      !translationWindow?.contains(selected.anchorNode)
    ) {
      setIsTranslationBoxOpen(false);
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

    if (selectionData.text && isTranslationBoxOpen) {
      setIsTranslationBoxOpen(false);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSelectionData({
      text: selected.toString(),
      selection: selected,
    });
  }, []);

  const handleSelectionChange = (e: Event) => {
    handleSelection(e);
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document?.removeEventListener("selectionchange", handleSelectionChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleSelection]);

  return { selectionData, setSelectionData };
};

export default useSelection;
