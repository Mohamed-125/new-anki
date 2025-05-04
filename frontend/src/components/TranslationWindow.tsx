import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "./Button";
import axios from "axios";
import Loading from "./Loading";
import Form from "./Form";
import { px } from "framer-motion";
import { BookType, ExternalLink } from "lucide-react";
import { root } from "postcss";
import container from "quill/blots/container";
import { twMerge } from "tailwind-merge";
import { createPortal } from "react-dom";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { languageCodeMap } from "@/languages";

const TranslationWindow = ({
  selectionData,
  setIsAddCardModalOpen,
  setDefaultValues,
  setContent,
  text = false,
  isSameUser,
}: {
  selectionData: {
    text: string;
  };
  text?: boolean;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultValues: any;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
  isSameUser: boolean;
}) => {
  // const parent =
  //   selectionData?.ele?.parentElement?.parentElement?.parentElement;
  // const rect = parent.getBoundingClientRect();
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en"); // Default to English
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [isTranslationBoxOpen, setIsTraslationBoxOpen] = useState(false);
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();
  // useEffect(() => {
  //   setEleHeight(rect?.bottom - rect?.top);
  // }, []);

  // Function to open Reverso Context in a popup window
  const openReversoPopup = (
    word: string,
    sourceLang: string,
    targetLang: string
  ) => {
    const url = `https://conjugator.reverso.net/conjugation-${
      languageCodeMap[selectedLearningLanguage]
    }-verb-${encodeURIComponent(word)}.html`;
    window.open(url, "_blank", "width=800,height=600");
  };

  useEffect(() => {
    if (selectionData.text && targetLanguage && isTranslationBoxOpen) {
      setIsTranslationLoading(true);
      const text = selectionData.text.replaceAll("\n", " ");
      axios
        .post(`/translate?targetLanguage=${targetLanguage}`, { text })
        .then((res) => {
          setTranslatedText(res.data);
        })
        .finally(() => {
          setIsTranslationLoading(false);
        });
    }
    if (!selectionData.text) {
      setIsTraslationBoxOpen(false);
    }
  }, [selectionData.text, isTranslationBoxOpen, targetLanguage]);

  const calculatePositionInText = useMemo(() => {
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
      console.log(textDiv?.clientWidth || subtitlesDiv?.clientWidth);
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
            console.log("ran");

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

    if (!translationContainer) return;
    if (isTranslationBoxOpen) {
      translationContainer.style.width = `80%`;
    } else {
      translationContainer.style.width = `fit-content`;
    }

    let top;
    let left;

    if (rect) {
      const captionsDivClientRect = captionsDiv?.getBoundingClientRect();
      left = `${rect.left - captionsDivClientRect.left}px`;

      const calculateLeft = () => {
        if (window.innerWidth < 650) {
          left = `${0}px`;
          translationContainer.style.transform = `translate(0px)`;
        } else {
          if (
            (rect.left - captionsDivClientRect.left) /
              captionsDivClientRect.width >
            0.5
          ) {
            if (isTranslationBoxOpen) {
              translationContainer.style.transform = `translate(-${translationContainer.scrollWidth}px)`;
            } else {
              translationContainer.style.transform = `translate(-105%)`;
            }
          } else {
            left = `${rect.left - captionsDivClientRect.left + rect.width}px`;

            if (isTranslationBoxOpen) {
              translationContainer.style.transform = `translate(0px)`;
            } else {
              translationContainer.style.transform = `translate(-50%)`;
            }
          }
        }
      };

      top = `${
        captionsDiv?.scrollTop +
        (rect.top - captionsDivClientRect.top) +
        rect.height +
        10
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

  return [
    // createPortal(
    <div
      id="translationContainer"
      className={twMerge(
        "absolute z-50   opacity-0  max-w-[270px]  ",
        selectionData.text && "opacity-100  "
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
          onClick={() => setTimeout(() => setIsTraslationBoxOpen(true), 0)}
        >
          <BookType className="pointer-events-none" />
        </Button>
      ) : (
        <div
          id="translationWindow"
          className={`px-4 py-7 bg-white rounded-xl border border-gray-200 translationWindow text-wrap bordrer`}
        >
          <div id="translationWindow">
            {" "}
            <Form.Label>Choose the target language :</Form.Label>
            <Form.Select
              defaultValue={"EN"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setTargetLanguage(e.target.value.toLowerCase());
              }}
              data-placeholder="Target Language..."
            >
              <option value="AF">Afrikaans</option>
              <option value="SQ">Albanian</option>
              <option value="AR">Arabic</option>
              <option value="HY">Armenian</option>
              <option value="EU">Basque</option>
              <option value="BN">Bengali</option>
              <option value="BG">Bulgarian</option>
              <option value="CA">Catalan</option>
              <option value="KM">Cambodian</option>
              <option value="ZH">Chinese (Mandarin)</option>
              <option value="HR">Croatian</option>
              <option value="CS">Czech</option>
              <option value="DA">Danish</option>
              <option value="NL">Dutch</option>
              <option value="EN">English</option>
              <option value="ET">Estonian</option>
              <option value="FJ">Fiji</option>
              <option value="FI">Finnish</option>
              <option value="FR">French</option>
              <option value="KA">Georgian</option>
              <option value="DE">German</option>
              <option value="EL">Greek</option>
              <option value="GU">Gujarati</option>
              <option value="HE">Hebrew</option>
              <option value="HI">Hindi</option>
              <option value="HU">Hungarian</option>
              <option value="IS">Icelandic</option>
              <option value="ID">Indonesian</option>
              <option value="GA">Irish</option>
              <option value="IT">Italian</option>
              <option value="JA">Japanese</option>
              <option value="JW">Javanese</option>
              <option value="KO">Korean</option>
              <option value="LA">Latin</option>
              <option value="LV">Latvian</option>
              <option value="LT">Lithuanian</option>
              <option value="MK">Macedonian</option>
              <option value="MS">Malay</option>
              <option value="ML">Malayalam</option>
              <option value="MT">Maltese</option>
              <option value="MI">Maori</option>
              <option value="MR">Marathi</option>
              <option value="MN">Mongolian</option>
              <option value="NE">Nepali</option>
              <option value="NO">Norwegian</option>
              <option value="FA">Persian</option>
              <option value="PL">Polish</option>
              <option value="PT">Portuguese</option>
              <option value="PA">Punjabi</option>
              <option value="QU">Quechua</option>
              <option value="RO">Romanian</option>
              <option value="RU">Russian</option>
              <option value="SM">Samoan</option>
              <option value="SR">Serbian</option>
              <option value="SK">Slovak</option>
              <option value="SL">Slovenian</option>
              <option value="ES">Spanish</option>
              <option value="SW">Swahili</option>
              <option value="SV">Swedish </option>
              <option value="TA">Tamil</option>
              <option value="TT">Tatar</option>
              <option value="TE">Telugu</option>
              <option value="TH">Thai</option>
              <option value="BO">Tibetan</option>
              <option value="TO">Tonga</option>
              <option value="TR">Turkish</option>
              <option value="UK">Ukrainian</option>
              <option value="UR">Urdu</option>
              <option value="UZ">Uzbek</option>
              <option value="VI">Vietnamese</option>
              <option value="CY">Welsh</option>
              <option value="XH">Xhosa</option>
            </Form.Select>
            <p>{selectionData.text}</p>
            <hr className="my-2"></hr>
            <div className="relative min-h-20">
              <p>{isTranslationLoading ? <Loading /> : translatedText}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              className={"flex-1 text-base"}
              disabled={isTranslationLoading}
              onClick={() => {
                setIsAddCardModalOpen(true);
                setDefaultValues({
                  front: selectionData.text,
                  back: translatedText,
                  content: "",
                });
              }}
            >
              Save to your cards
            </Button>
            <Button
              className={
                "flex justify-center items-center text-base bg-purple-500 hover:bg-purple-600"
              }
              onClick={() => {
                // Get the source language (learning language) and target language (user's native language)
                const sourceLang =
                  languageCodeMap[selectedLearningLanguage.toLowerCase()] ||
                  "english";
                const targetLang =
                  languageCodeMap[targetLanguage.toLowerCase()] || "english";

                // Open Reverso Context in a popup
                openReversoPopup(selectionData.text, sourceLang, targetLang);
              }}
              title="Open in Reverso Context"
            >
              <ExternalLink size={18} className="mr-1" /> Reverso
            </Button>
          </div>
        </div>
      )}
    </div>,
  ];
};

export default TranslationWindow;
