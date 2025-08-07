import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import throttle from "lodash.throttle";

type SelectionData = {
  text: string;
  selection: Selection | null;
};

export default function useSelection(limit = 50) {
  const [selectionData, setSelectionData] = useState<SelectionData>({
    text: "",
    selection: null,
  });

  const [isPending, startTransition] = useTransition();

  const captionsDiv = useRef<HTMLElement | null>(null);
  const translationWindow = useRef<HTMLElement | null>(null);
  const textDivRef = useRef<HTMLElement | null>(null);
  const lastText = useRef<string>("");

  useEffect(() => {
    captionsDiv.current = document.getElementById("captions-div");
    translationWindow.current = document.getElementById("translationWindow");
    textDivRef.current = document.querySelector(".text-div");
  }, []);

  const updateSelection = useCallback(
    (sel: Selection, text: string) => {
      if (text === lastText.current) return;
      lastText.current = text;

      requestIdleCallback(() => {
        startTransition(() => {
          setSelectionData({ text, selection: sel });
        });
      });
    },
    [startTransition]
  );

  const throttledUpdate = useRef(
    throttle((sel: Selection, text: string) => {
      updateSelection(sel, text);
    }, limit)
  ).current;

  const resetSelection = () => {
    setSelectionData({ text: "", selection: null });
    lastText.current = "";
  };

  const processSelection = useCallback(
    (sel: Selection | null) => {
      if (!sel || !sel.anchorNode) return resetSelection();

      const rawText = sel.toString();
      const cleanedText = rawText.replace(/\s+/g, "").trim();

      console.log(rawText);
      // Filter out empty or single character selections
      if (
        !cleanedText ||
        cleanedText.length < 2 ||
        cleanedText.split("").length <= 1
      ) {
        console.log("resseting");
        return resetSelection();
      }

      // Prevent selecting inside the translation popup
      if (translationWindow.current?.contains(sel.anchorNode)) {
        return resetSelection();
      }

      // // Ensure selection is inside captions
      // let node: Node | null = sel.anchorNode;
      // let insideCaptions = false;
      // while (node && node !== document.body) {
      //   if (
      //     (node as HTMLElement).id === "captions-div" ||
      //     (node as HTMLElement).dataset?.captions !== undefined
      //   ) {
      //     insideCaptions = true;
      //     break;
      //   }
      //   node = node.parentNode;
      // }

      // if (!insideCaptions) return resetSelection();

      throttledUpdate(sel, rawText.trim());
    },
    [throttledUpdate]
  );

  useEffect(() => {
    const captions = captionsDiv.current;
    const textDiv = textDivRef.current;

    const handleSelection = () => {
      const sel = window.getSelection();

      processSelection(sel);
    };

    if (captions) {
      captions.addEventListener("mouseup", handleSelection);
      captions.addEventListener("keyup", handleSelection);
    }
    if (textDiv) {
      textDiv.addEventListener("mouseup", handleSelection);
      textDiv.addEventListener("keyup", handleSelection);
    }
    return () => {
      if (captions) {
        captions.removeEventListener("mouseup", handleSelection);
        captions.removeEventListener("keyup", handleSelection);
      }
      if (textDiv) {
        textDiv.removeEventListener("mouseup", handleSelection);
        textDiv.removeEventListener("keyup", handleSelection);
      }
      throttledUpdate.cancel();
    };
  }, [processSelection, throttledUpdate]);

  return { selectionData, isPending, setSelectionData };
}
