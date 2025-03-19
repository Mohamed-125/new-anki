import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "react-use";
import { UserType } from "@/hooks/useGetCurrentUser";

type SelectedLearningLanguageContextType = {
  selectedLearningLanguage: string;
  setSelectedLearningLanguage: React.Dispatch<React.SetStateAction<string>>;
};

export const selectedLearningLanguageContext =
  createContext<SelectedLearningLanguageContextType | null>(null);

export const useGetSelectedLearningLanguage = () => {
  const context = useContext(selectedLearningLanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
  user?: UserType | null;
};

export const LanguageProvider = ({ children, user }: LanguageProviderProps) => {
  const [
    selectedLearningLanguageLocalValue,
    setSelectedLearningLanguageLocalValue,
  ] = useLocalStorage("selectedLearningLanguage", "");

  const [selectedLearningLanguage, setSelectedLearningLanguage] = useState(
    selectedLearningLanguageLocalValue || ""
  );

  useEffect(() => {
    if (user?.languages?.length && !selectedLearningLanguage) {
      const newLanguage = user.languages[0];
      setSelectedLearningLanguage(newLanguage);
      setSelectedLearningLanguageLocalValue(newLanguage);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLearningLanguage) {
      setSelectedLearningLanguageLocalValue(selectedLearningLanguage);
    }
  }, [selectedLearningLanguage, setSelectedLearningLanguageLocalValue]);

  return (
    <selectedLearningLanguageContext.Provider
      value={{ selectedLearningLanguage, setSelectedLearningLanguage }}
    >
      {children}
    </selectedLearningLanguageContext.Provider>
  );
};
