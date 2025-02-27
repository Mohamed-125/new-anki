import TranslationWindow from "@/components/TranslationWindow";
import { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";

const useSelection = ({
  // isAddCardModalOpen,
  setContent,
  setDefaultValues,
  setIsAddCardModalOpen,
}: {
  // isAddCardModalOpen: boolean;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
  setDefaultValues: React.Dispatch<
    React.SetStateAction<{ front: string; back: string; content: string }>
  >;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const selectionRef = useRef<{ ele: HTMLElement | null; text: string }>({
    ele: null,
    text: "",
  });

  const [selectionData, setSelectionData] = useState<{
    ele: HTMLElement | null;
    text: string;
  }>({
    ele: null,
    text: "",
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced selection handler
  const handleSelection = useCallback(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const selected = window.getSelection();
      if (!selected?.toString()) return;

      const focusNode = selected.focusNode as HTMLElement;
      const anchorNode = selected.anchorNode as HTMLElement;
      const selectedElement =
        focusNode?.nodeName === "#text"
          ? (focusNode.parentNode as HTMLElement)
          : focusNode?.children[0] ?? anchorNode?.parentNode;

      // Update ref (won't trigger re-renders)
      selectionRef.current = {
        ele: selectedElement as HTMLElement,
        text: selected.toString(),
      };

      // Update state only if necessary
      setSelectionData((prev) => {
        if (
          prev.text === selectionRef.current.text &&
          prev.ele === selectionRef.current.ele
        ) {
          return prev;
        }
        return selectionRef.current;
      });
    }, 300); // Debounce for 300ms
  }, []);

  useEffect(() => {
    const removeSelection = (e: Event) => {
      if (
        (e.target as HTMLElement)?.id !== "translationWindow" &&
        (e.target as HTMLElement)?.id !== "translationBtn"
      ) {
        setSelectionData({ ele: null, text: "" });
      }
    };

    const handleSelectionChange = (e: Event) => {
      const selected = window.getSelection();

      console.log(selected);
      if (selected?.toString()) {
        handleSelection();
      } else {
        removeSelection(e);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelection]);

  useEffect(() => {
    if (!selectionData.text) return;

    const container = document.createElement("div");
    const root = ReactDOM.createRoot(container);
    container.style.position = "absolute";

    const rect = selectionData.ele?.getBoundingClientRect();
    if (!rect) return;
    container.style.top = `${rect.bottom - rect.top}px`;

    if (selectionData.ele && selectionData.text.length) {
      selectionData.ele.insertBefore(container, null);
      root.render(
        <TranslationWindow
          text={true}
          selectionData={selectionData}
          setContent={setContent}
          setDefaultValues={setDefaultValues}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      );
    }

    return () => {
      setTimeout(() => {
        root.unmount();
        container?.remove();
      }, 150);
    };
  }, [selectionData]);

  return { selectionData };
};

export default useSelection;
