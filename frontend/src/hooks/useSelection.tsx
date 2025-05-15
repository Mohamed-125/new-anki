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

    timeoutRef.current = setTimeout(() => {
      setSelectionData({
        text: selected.toString(),
        selection: selected,
      });
    }, delay);
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
