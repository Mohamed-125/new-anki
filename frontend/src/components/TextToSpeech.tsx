import React from "react";
import Button from "./Button";
import { BsVolumeUp } from "react-icons/bs";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

type TextToSpeechProps = {
  text: string;
  language?: string;
};

const languageVoices = {
  en: "UK English Female",
  de: "Deutsch Female",
  es: "Spanish Female",
  fr: "French Female",
  it: "Italian Female",
  ja: "Japanese Female",
  ko: "Korean Female",
  zh: "Chinese Female",
  ru: "Russian Female",
  pt: "Portuguese Female",
  nl: "Dutch Female",
  pl: "Polish Female",
  tr: "Turkish Female",
};

export function TextToSpeech({ text, language = "en" }: TextToSpeechProps) {
  const { selectedLearningLanguage } = useGetCurrentUser();
  const handleSpeak = (e: Event) => {
    e.stopPropagation();
    const voice =
      languageVoices[selectedLearningLanguage as keyof typeof languageVoices] ||
      languageVoices.en;
    window.responsiveVoice.speak(text, voice, {
      pitch: 1,
      rate: 0.9,
      volume: 1,
      onstart: () => console.log("Started speaking"),
      onend: () => console.log("Finished speaking"),
    });
  };

  return (
    <Button
      onClick={handleSpeak}
      variant="ghost"
      size="icon"
      type="button"
      className="px-0 !py-0 text-black w-fit hover:bg-blue-50 hover:text-blue-600"
      title="Listen to pronunciation"
    >
      <BsVolumeUp className="w-6 h-6" />
    </Button>
  );
}
