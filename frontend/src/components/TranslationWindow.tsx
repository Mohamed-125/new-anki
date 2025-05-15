import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./TranslationWindow.css";
import Button from "./Button";
import axios from "axios";
import Loading from "./Loading";
import Form from "./Form";
import { BookType, ExternalLink, Save, Plus } from "lucide-react";

import { TextToSpeech } from "./TextToSpeech";
import { twMerge } from "tailwind-merge";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { languageCodeMap } from "../../../languages";
import { useWindowSize } from "react-use";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/Drawer";
import useToasts from "@/hooks/useToasts";
import { fetchConjugations } from "../utils/conjugations";
import useModalsStates from "@/hooks/useModalsStates";
import { Skeleton } from "./ui/skeleton";

const TranslationWindow = ({
  selectionData,
  setIsAddCardModalOpen,
  setDefaultValues,
}: {
  selectionData: {
    text: string;
  };
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultValues: any;
}) => {
  // const parent =
  //   selectionData?.ele?.parentElement?.parentElement?.parentElement;
  // const rect = parent.getBoundingClientRect();
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en"); // Default to English
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(
    []
  );
  const [translationData, setTranslationData] = useState<any>(null);
  const { isTranslationBoxOpen, setIsTranslationBoxOpen, defaultValues } =
    useModalsStates();

  const handleTranslationClick = (translation: string) => {
    setSelectedTranslations((prev) => {
      const newTranslations = prev.includes(translation)
        ? prev.filter((t) => t !== translation)
        : [...prev, translation];

      console.log(newTranslations);
      setDefaultValues({
        ...defaultValues,
        back:
          newTranslations.length > 0
            ? newTranslations.join(", ")
            : translationData.word.translations[targetLanguage].join(", "),
      });

      return newTranslations;
    });
  };

  console.log(defaultValues);
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();
  // useEffect(() => {
  //   setEleHeight(rect?.bottom - rect?.top);
  // }, []);

  // useEffect(() => {
  //   console.log(isTranslationBoxOpen);
  //   const handleScroll = () => {
  //     console.log("tsrtrst");
  //     if (isTranslationBoxOpen) {
  //       setIsTranslationBoxOpen(false);
  //     }
  //   };

  //   if (isTranslationBoxOpen) {
  //     window.addEventListener("scroll", handleScroll);
  //   }

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [isTranslationBoxOpen, setIsTranslationBoxOpen]);

  // useEffect(() => {
  //   if (!isTranslationBoxOpen) {
  //     setTranslatedText("");
  //   }
  // }, [isTranslationBoxOpen]);
  // Function to open Reverso Context in a popup window
  const [showReversoIframe, setShowReversoIframe] = useState(false);
  const [reversoUrl, setReversoUrl] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isSmallScreen = useWindowSize().width < 765;

  const [conjugations, setConjugations] = useState<
    { tense: string; conjugations: { person: string; form: string }[] }[]
  >([]);
  const [isLoadingConjugations, setIsLoadingConjugations] = useState(false);
  const { addToast } = useToasts();

  const openReversoPopup = (
    word: string,
    sourceLang: string,
    targetLang: string
  ) => {
    if (isSmallScreen) {
      fetchConjugations(word, sourceLang).then((conjugations) =>
        setConjugations(conjugations)
      );
      setIsDrawerOpen(true);
    } else {
      const url = `https://context.reverso.net/translation/${sourceLang}-${targetLang}/${encodeURIComponent(
        word
      )}`;
      window.open(url, "_blank", "width=800,height=600");
    }
  };

  const getContextString = useMemo(() => {
    if (
      !selectionData?.selection ||
      !selectionData.text ||
      !isTranslationBoxOpen
    ) {
      return "";
    }

    try {
      let range = (selectionData.selection as Selection).getRangeAt(0);
      let startNode = range.startContainer;
      let endNode = range.endContainer;

      // Normalize start and end to span parents
      if (startNode?.nodeType === 3) {
        startNode =
          startNode.parentElement?.tagName === "H4"
            ? startNode.nextSibling
            : startNode.parentElement;
      }
      if (endNode?.nodeType === 3) {
        endNode =
          endNode.parentElement?.tagName === "H4"
            ? endNode.nextSibling
            : endNode.parentElement;
      }

      // Validate that endNode is a span with data-number
      if (
        !endNode ||
        !(endNode instanceof HTMLSpanElement) ||
        !endNode.dataset.number
      ) {
        console.warn("End node is not a valid span with data-number");
        return;
      }

      // Get all spans
      const allSpans = Array.from(
        endNode.parentElement?.querySelectorAll("span[data-number]") || []
      );

      // Find index of the end span
      const endIndex = allSpans.findIndex((el) => el === endNode);
      const startIndex = allSpans.findIndex((el) => el === startNode);

      // Get 20 before from start index and 20 after from **end index**
      const before = allSpans.slice(Math.max(startIndex - 15, 0), startIndex);
      const after = allSpans.slice(endIndex + 1, endIndex + 16);

      const clean = (str: string) => str.replace(/[()]/g, "");

      const beforeText = clean(before.map((el) => el.textContent).join(" "));
      const afterText = clean(after.map((el) => el.textContent).join(" "));
      const selectedText = clean(selectionData.text.replaceAll("\n", " "));

      return `${beforeText} ((${selectedText})) ${afterText}`;
    } catch (err) {
      console.warn("Error getting context string:", err);
      return selectionData.text;
    }
  }, [selectionData, isTranslationBoxOpen]);

  useEffect(() => {
    if (!selectionData.text) {
      return;
    }

    setTranslatedText("");
    setIsTranslationLoading(true);

    if (!targetLanguage || !isTranslationBoxOpen) return;

    const contextString = getContextString;

    if (!contextString) return;

    const controller = new AbortController();
    const getTranslationHandler = async () => {
      setTranslationData(null); // Clear previous translation data
      try {
        const res = await axios.post(
          `/translate?language=${selectedLearningLanguage}&targetLanguage=${targetLanguage}`,
          { text: contextString },
          { signal: controller.signal }
        );
        setTranslationData(res.data);
        if (res.data.fromDatabase) {
          // Only show languages that have translations
          const availableLanguages = Object.keys(
            res.data.word.translations
          ).filter((lang) => res.data.word.translations[lang]?.length > 0);
          if (
            availableLanguages.length > 0 &&
            !availableLanguages.includes(targetLanguage)
          ) {
            setTargetLanguage(availableLanguages[0]);
          }
        }
        setIsTranslationLoading(false);
      } catch (err) {
        if (err.message !== "canceled") {
          console.error("Translation error:", err);
          setIsTranslationBoxOpen(false);
          setIsTranslationLoading(false);
        }
      }
    };

    getTranslationHandler();

    return () => controller.abort();
  }, [
    selectionData,
    targetLanguage,
    isTranslationBoxOpen,
    getContextString,
    selectedLearningLanguage,
  ]);

  const calculatePositionInText = useMemo(() => {
    if (!selectionData?.text) return { top: "", left: "" };
    const textDiv = document.querySelector(".text-div")!;
    const subtitlesDiv = document.querySelector(".subtitles-div");
    const select = window.getSelection();

    const selection = window.getSelection();
    if (!selection || !(selection.rangeCount > 0))
      return {
        top: "",
        left: "",
      };

    const translationContainer = document.getElementById(
      "translationContainer"
    )!;

    const range = select?.getRangeAt(0);

    const rect = range?.getClientRects()[range?.getClientRects().length - 1];
    const windowWidth = window.innerWidth;

    if (!translationContainer) return;

    if (isTranslationBoxOpen) {
      translationContainer.style.width = `80%`;
      if (textDiv) {
        // translationContainer.style.maxWidth = `${textDiv?.clientWidth}px`;
      }
    } else {
      translationContainer.style.width = `fit-content`;
    }

    let top;
    let left;

    if (rect) {
      const calculateLeft = () => {
        left = `${rect?.left + rect.width}px`;
        if (window.innerWidth < 400) {
          if (isTranslationBoxOpen) {
            left = `${20}px`;
            translationContainer.style.transform = `translate(0px)`;
          } else {
            translationContainer.style.transform = `translate(-50%)`;
          }
        } else {
          if (rect.right / windowWidth > 0.5) {
            if (isTranslationBoxOpen) {
              translationContainer.style.transform = `translate(-${translationContainer.scrollWidth}px)`;
            } else {
              translationContainer.style.transform = `translate(-50%)`;
            }
          } else {
            if (isTranslationBoxOpen) {
              translationContainer.style.transform = `translate(0px)`;
            } else {
              translationContainer.style.transform = `translate(-50%)`;
            }
          }
        }
      };

      top = `${
        document.documentElement.scrollTop + rect.top + rect.height + 10
      }px`;
      calculateLeft();

      return { top, left };
    } else {
      return {
        top: "",
        left: "",
      };
    }
  }, [selectionData, isTranslationBoxOpen]);

  const calculatePositionInVideo = useMemo(() => {
    if (!selectionData?.text) return { top: "", left: "" };
    const captionsDiv = document.getElementById("captions-div")!;

    if (!captionsDiv) return;
    const select = window.getSelection();

    const selection = window.getSelection();
    if (!selection || !(selection.rangeCount > 0))
      return {
        top: "",
        left: "",
      };

    const translationContainer = document.getElementById(
      "translationContainer"
    )!;

    const range = select?.getRangeAt(0);
    const rect = range?.getClientRects()[range?.getClientRects().length - 1];

    if (!translationContainer || !rect) return;

    const captionsDivClientRect = captionsDiv?.getBoundingClientRect();
    const containerRect = translationContainer.getBoundingClientRect();

    // Set width based on state
    translationContainer.style.width = isTranslationBoxOpen
      ? "80%"
      : "fit-content";

    // Calculate base position
    const relativeTop = rect.bottom - captionsDivClientRect.top;
    const scrollOffset = captionsDiv.scrollTop;

    // Calculate left position
    let left = rect.left - captionsDivClientRect.left;
    let transform = "translate(-50%)";

    // Adjust horizontal position based on screen width and container size
    if (window.innerWidth < 650) {
      left = 0;
      transform = "translate(0)";
    } else {
      const isRightHalf =
        (rect.left - captionsDivClientRect.left) / captionsDivClientRect.width >
        0.5;

      if (isRightHalf) {
        transform = isTranslationBoxOpen
          ? `translate(-${translationContainer.scrollWidth}px)`
          : "translate(-105%)";
      } else {
        left += rect.width;
        transform = isTranslationBoxOpen ? "translate(0)" : "translate(-50%)";
      }
    }

    // Apply transform
    translationContainer.style.transform = transform;

    return {
      top: `${relativeTop + scrollOffset}px`,
      left: `${left}px`,
    };
  }, [selectionData, isTranslationBoxOpen]);

  useEffect(() => {
    console.log(translationData);
  }, [translationData]);

  return (
    <div
      id="translationContainer"
      className={twMerge(
        "absolute z-30 hidden max-w-[300px] shadow-md",
        selectionData.text && selectionData.text.length < 250 && "block",
        !isTranslationBoxOpen && "!w-0"
      )}
      style={{
        top: document.getElementById("captions-div")
          ? calculatePositionInVideo?.top
          : calculatePositionInText?.top,
        left: document.getElementById("captions-div")
          ? calculatePositionInVideo?.left
          : calculatePositionInText?.left,
      }}
    >
      {!isTranslationBoxOpen ? (
        <Button
          id="translateBtn"
          className="p-2 bg-blue-400 border-none"
          onClick={() => setTimeout(() => setIsTranslationBoxOpen(true), 0)}
        >
          {isTranslationBoxOpen}
          <BookType className="pointer-events-none" />
        </Button>
      ) : (
        <div
          id="translationWindow"
          className={`px-4 py-5 bg-white rounded-xl border border-gray-200 shadow-sm translationWindow text-wrap ${
            isTranslationBoxOpen ? "open" : ""
          }`}
        >
          {translationData?.fromDatabase ? (
            <>
              <Form.Label>Available translations:</Form.Label>
              <Form.Select
                defaultValue={targetLanguage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setTargetLanguage(e.target.value.toLowerCase());
                }}
                data-placeholder="Target Language..."
              >
                {Object.keys(translationData.word.translations).map((lang) => (
                  <option key={lang} value={lang}>
                    {languageCodeMap[lang].charAt(0).toUpperCase() +
                      languageCodeMap[lang].slice(1) ||
                      lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </Form.Select>
              <div className="flex gap-1 items-center mt-2">
                <TextToSpeech
                  text={selectionData.text}
                  language={selectedLearningLanguage.toLowerCase()}
                />
                <p className="font-semibold text-md">{selectionData.text}</p>
              </div>
              {translationData?.word.base.plural && (
                <div className="p-2 text-gray-700 bg-gray-50 rounded-lg">
                  {translationData.word.base.singular &&
                    translationData.word.base.plural && (
                      <div className="">
                        {selectedLearningLanguage.toLowerCase() === "de"
                          ? `${translationData.word.lemma.split(" ")[0]} `
                          : ""}
                        {translationData.word.base.singular}
                        <>
                          {" "}
                          /{" "}
                          {selectedLearningLanguage.toLowerCase() === "de"
                            ? "die "
                            : ""}
                          {translationData.word.base.plural}
                        </>
                      </div>
                    )}
                </div>
              )}
              <hr className="my-2 !mb-5" />
              <div className="relative min-h-20">
                {isTranslationLoading ? (
                  <Loading />
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {translationData.word.translations[targetLanguage]?.map(
                        (translation, index) => (
                          <button
                            key={index}
                            onClick={() => handleTranslationClick(translation)}
                            className={`px-3 py-1 rounded-full text-base transition-colors ${
                              selectedTranslations.includes(translation)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {translation}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Form.Label>Choose the target language:</Form.Label>
              <Form.Select
                defaultValue={targetLanguage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setTargetLanguage(e.target.value.toLowerCase());
                }}
                data-placeholder="Target Language..."
              >
                {Object.entries(languageCodeMap).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </option>
                ))}
              </Form.Select>
              <div className="flex gap-1 items-center mt-2">
                <TextToSpeech
                  text={selectionData.text}
                  language={selectedLearningLanguage.toLowerCase()}
                />
                <p className="font-semibold text-md">{selectionData.text}</p>
              </div>

              {isTranslationLoading ? (
                <Skeleton className="h-7"></Skeleton>
              ) : (
                translationData?.base && (
                  <div className="p-2 text-gray-700 bg-gray-50 rounded-lg">
                    <div className="">
                      {translationData.base.singular} /{" "}
                      {translationData.base.plural}
                    </div>
                  </div>
                )
              )}
              <hr className="my-2" />
              <div className="relative min-h-20">
                {isTranslationLoading ? (
                  <Loading />
                ) : (
                  <div className="space-y-3">
                    <div className="text-base">
                      <p>{translationData?.translatedWord}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-gray-500">Actions</p>
            <div className="flex overflow-x-auto gap-2 pb-1">
              <Button
                className={"flex items-center p-2 h-9 text-sm"}
                disabled={isTranslationLoading}
                onClick={() => {
                  setIsAddCardModalOpen(true);
                  setDefaultValues((prev) => {
                    return {
                      ...prev,
                      front: selectionData.text,
                      content: "",
                    };
                  });
                }}
                title="Save to your cards"
              >
                <Save size={16} className="mr-1" /> Save
              </Button>
              <Button
                className={
                  "flex items-center p-2 h-9 text-sm bg-purple-500 hover:bg-purple-600"
                }
                onClick={() => {
                  const sourceLang =
                    languageCodeMap[selectedLearningLanguage.toLowerCase()] ||
                    "english";
                  const targetLang =
                    languageCodeMap[targetLanguage.toLowerCase()] || "english";

                  openReversoPopup(selectionData.text, sourceLang, targetLang);
                }}
                title="View Conjugations"
              >
                <ExternalLink size={16} className="mr-1" /> Conjugate
              </Button>

              {isLoadingConjugations && (
                <div className="mt-4">
                  <Loading />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        {isSmallScreen && conjugations.length > 0 && (
          <Drawer
            open={isDrawerOpen}
            disablePreventScroll={true}
            shouldScaleBackground={true}
            onOpenChange={setIsDrawerOpen}
          >
            <DrawerContent onClick={(e) => e.stopPropagation()} className="">
              <DrawerHeader>
                <DrawerTitle>Conjugations</DrawerTitle>
                <div className="overflow-y-auto px-4 pb-8 h-[500px] space-y-4">
                  {conjugations.map((conj, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg shadow-sm"
                    >
                      <h4 className="mb-3 text-lg font-medium text-primary">
                        {conj.tense}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {conj.conjugations.map((c, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground">
                              {c.person}
                            </span>
                            <span className="font-medium">{c.form}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
};
export default React.memo(TranslationWindow);
