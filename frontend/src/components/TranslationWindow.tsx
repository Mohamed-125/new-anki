import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";
import axios from "axios";
import Loading from "./Loading";
import Form from "./Form";
import { px } from "framer-motion";

const TranslationWindow = ({
  selectionData,
  setIsAddCardModalOpen,
  setDefaultValues,
  setContent,
  text = false,
}: {
  selectionData: {
    ele: any;
    text: string;
  };
  text?: boolean;
  setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultValues: any;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  
  const parent =
    selectionData?.ele?.parentElement?.parentElement?.parentElement;
  const rect = parent.getBoundingClientRect();
  const [eleHeight, setEleHeight] = useState(0);
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en"); // Default to Spanish
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);

  useEffect(() => {
    setEleHeight(rect?.bottom - rect?.top);
  }, []);

  const caculateTop = () => {
    return !text ? eleHeight - 15 : 1;
    // return rect.top;
  };

  useEffect(() => {
    if (selectionData.text && targetLanguage) {
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
  }, [selectionData.text, targetLanguage]);

  return (
    <div
      style={{
        top: `${caculateTop()}px`,
        // left: `${rect?.left}px`,
      }}
      id="translationWindow"
      className={`translationWindow  absolute z-50 max-w-[400px] text-wrap px-4 bg-white border border-gray-200 py-7 rounded-xl bordrer min-w-[200px]`}
    >
      <Form.Label>Choose the target language :</Form.Label>
      <Form.Select
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
        <option value="EN" selected>
          English
        </option>
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
      <Button
        className={"text-base mt-3 "}
        disabled={isTranslationLoading}
        onClick={() => {
          
          setIsAddCardModalOpen(true);

          setDefaultValues({
            front: selectionData.text,
            back: translatedText,
            content: "",
          });

          setContent?.("");
        }}
      >
        Save to your cards
      </Button>
    </div>
  );
};

export default TranslationWindow;
