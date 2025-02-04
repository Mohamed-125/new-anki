import { useEffect } from "react";

import React from "react";

const useAddModalShortcuts = (
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,

  collection = false
) => {
  const shortcuts = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !collection) {
      setIsModalOpen(true);
    }
    if (e.key === "Escape") {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    document.querySelector("body")?.addEventListener("keydown", shortcuts);
    return () =>
      document.querySelector("body")?.removeEventListener("keydown", shortcuts);
  }, []);
};

export default useAddModalShortcuts;
