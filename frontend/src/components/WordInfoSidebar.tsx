import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import Button from "./Button";
import Loading from "./Loading";

interface WordInfoSidebarProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  onAddCard?: (data: { front: string; back: string; content?: string }) => void;
}

interface Translation {
  translation: string;
  partOfSpeech?: string;
  examples?: string[];
}

interface VerbConjugation {
  tense: string;
  conjugations: {
    person: string;
    form: string;
  }[];
}

const WordInfoSidebar: React.FC<WordInfoSidebarProps> = ({
  word,
  isOpen,
  onClose,
  onAddCard,
}) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isVerb, setIsVerb] = useState<boolean>(false);
  const [conjugations, setConjugations] = useState<VerbConjugation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("en"); // Default to English

  useEffect(() => {
    if (word && isOpen) {
      fetchWordInfo();
    }
  }, [word, isOpen, targetLanguage]);

  const fetchWordInfo = async () => {
    setLoading(true);
    try {
      // Fetch translation
      const translationResponse = await axios.post(
        `/translate?targetLanguage=${targetLanguage}`,
        {
          text: word.trim(),
        }
      );

      // For demo purposes, we'll create a structured response
      // In a real app, you would parse the actual API response
      const translationData = translationResponse.data;

      // Create a structured translation object
      const formattedTranslations: Translation[] = [
        {
          translation: translationData,
          partOfSpeech: "unknown", // This would come from a dictionary API
          examples: [], // This would come from a dictionary API
        },
      ];

      setTranslations(formattedTranslations);

      // Check if the word is a verb (this would be determined by a proper API)
      // For demo, we'll check if the word ends with common verb endings
      const commonVerbEndings = ["ar", "er", "ir", "en"]; // Example for Spanish/French/German
      const isVerbCheck = commonVerbEndings.some((ending) =>
        word.toLowerCase().endsWith(ending)
      );
      setIsVerb(isVerbCheck);

      // If it's a verb, fetch conjugations (in a real app)
      if (isVerbCheck) {
        // This would be a real API call in production
        // For demo, we'll create mock conjugations
        const mockConjugations: VerbConjugation[] = [
          {
            tense: "Present",
            conjugations: [
              { person: "I", form: `${word.slice(0, -2)}o` },
              { person: "You", form: `${word.slice(0, -2)}as` },
              { person: "He/She", form: `${word.slice(0, -2)}a` },
              { person: "We", form: `${word.slice(0, -2)}amos` },
              { person: "You (plural)", form: `${word.slice(0, -2)}áis` },
              { person: "They", form: `${word.slice(0, -2)}an` },
            ],
          },
          {
            tense: "Past",
            conjugations: [
              { person: "I", form: `${word.slice(0, -2)}é` },
              { person: "You", form: `${word.slice(0, -2)}aste` },
              { person: "He/She", form: `${word.slice(0, -2)}ó` },
              { person: "We", form: `${word.slice(0, -2)}amos` },
              { person: "You (plural)", form: `${word.slice(0, -2)}asteis` },
              { person: "They", form: `${word.slice(0, -2)}aron` },
            ],
          },
        ];

        setConjugations(mockConjugations);
      }
    } catch (error) {
      console.error("Error fetching word information:", error);
      setTranslations([{ translation: "Translation not available" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCards = () => {
    if (onAddCard && translations.length > 0) {
      onAddCard({
        front: word,
        back: translations[0].translation,
        content: translations[0].examples?.join("\n"),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overflow-y-auto fixed top-0 right-0 z-50 w-80 h-full bg-white shadow-lg transition-transform duration-300 transform">
      <div className="flex sticky top-0 z-10 justify-between items-center p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{word}</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  Translation
                </h3>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-2 py-1 text-sm rounded border border-gray-300"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {translations.map((translation, index) => (
                <div key={index} className="p-3 mb-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-medium">
                    {translation.translation}
                  </div>
                  {translation.partOfSpeech &&
                    translation.partOfSpeech !== "unknown" && (
                      <div className="mt-1 text-sm text-gray-500">
                        {translation.partOfSpeech}
                      </div>
                    )}
                  {translation.examples && translation.examples.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">
                        Examples:
                      </p>
                      <ul className="mt-1 text-sm list-disc list-inside text-gray-600">
                        {translation.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isVerb && conjugations.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  Verb Conjugation
                </h3>
                {conjugations.map((conjugation, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="mb-1 font-medium text-gray-600">
                      {conjugation.tense}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {conjugation.conjugations.map((conj, i) => (
                        <div
                          key={i}
                          className="flex justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {conj.person}
                          </span>
                          <span className="text-sm font-medium">
                            {conj.form}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={handleAddToCards}
                className="flex gap-2 justify-center items-center w-full"
              >
                Add to Flashcards
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WordInfoSidebar;
