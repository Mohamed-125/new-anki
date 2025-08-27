import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
  RefObject,
} from "react";
import throttle from "lodash.throttle";

type SelectionData = {
  text: string;
  selection: Selection | null;
};

export default function useSelection({
  limit = 50,
  captionsDiv,
  translationRef,
  textDivRef,
}: {
  limit?: number;
  captionsDiv?: RefObject<HTMLElement>;
  translationRef: RefObject<HTMLElement>;
  textDivRef?: RefObject<HTMLElement>;
}) {
  const [selectionData, setSelectionData] = useState<SelectionData>({
    text: "",
    selection: null,
  });

  const [isPending, startTransition] = useTransition();

  const lastText = useRef<string>("");

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
      const cleanedText = rawText.replace(/\s+/g, " ").trim();

      // Filter out invalid selections
      if (!cleanedText || cleanedText.length < 2) {
        return resetSelection();
      }

      // Prevent selecting inside the translation popup
      if (translationRef.current?.contains(sel.anchorNode)) {
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
    const captions = captionsDiv?.current;
    const textDiv = textDivRef?.current;

    const handleSelection = (e: MouseEvent | KeyboardEvent) => {
      // Prevent handling if the selection is within the translation window
      if (translationRef.current?.contains(e.target as Node)) {
        return;
      }

      const sel = window.getSelection();
      processSelection(sel);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Only reset if click is outside valid selection areas
      if (
        !captions?.contains(e.target as Node) &&
        !textDiv?.contains(e.target as Node) &&
        !translationRef.current?.contains(e.target as Node)
      ) {
        resetSelection();
      }
    };

    // Global events
    document.body.addEventListener("mouseup", handleGlobalMouseUp);
    document.body.addEventListener("keyup", resetSelection);

    // Caption-specific events
    if (captions) {
      captions.addEventListener("mouseup", handleSelection);
      captions.addEventListener("keyup", handleSelection);
    }

    // Text div specific events
    if (textDiv) {
      textDiv.addEventListener("mouseup", handleSelection);
      textDiv.addEventListener("keyup", handleSelection);
    }

    return () => {
      // Cleanup global events
      document.body.removeEventListener("mouseup", handleGlobalMouseUp);
      document.body.removeEventListener("keyup", resetSelection);

      // Cleanup caption-specific events
      if (captions) {
        captions.removeEventListener("mouseup", handleSelection);
        captions.removeEventListener("keyup", handleSelection);
      }

      // Cleanup text div specific events
      if (textDiv) {
        textDiv.removeEventListener("mouseup", handleSelection);
        textDiv.removeEventListener("keyup", handleSelection);
      }

      // Cancel any pending throttled updates
      throttledUpdate.cancel();
    };
  }, [processSelection, throttledUpdate]);

  return { selectionData, isPending, setSelectionData };
}
