import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { CollectionType } from "@/hooks/useGetCollections";
import useGetCards, { CardType } from "../hooks/useGetCards";
import { SRS } from "@/utils/srs";
import Button from "../components/Button";
import Skeleton from "@/components/ui/skeleton";
// @ts-ignore
import { useSpeech, useVoices } from "react-text-to-speech";
import TipTapEditor from "../components/TipTapEditor";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useUseEditor from "@/hooks/useUseEditor";
import { useRef } from "react";
import { TextToSpeech } from "@/components/TextToSpeech";
import {
  Edit,
  Edit2,
  Edit3,
  Edit3Icon,
  XCircleIcon,
  XIcon,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { BsXCircleFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import useModalsStates from "@/hooks/useModalsStates";
import { AddCardModal } from "@/components/AddCardModal";
import useDb from "../db/useDb";
import { useNetwork } from "@/context/NetworkStatusContext";
import OfflineFallback from "@/components/OfflineFallback";
import useDebounce from "../hooks/useDebounce";
import SearchSidebar from "../components/SearchSidebar";

const StudyCards = () => {
  const { user } = useGetCurrentUser();
  const collectionId = useParams()?.collectionId;
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const queryClient = useQueryClient();
  const [studyCardsView, setStudyCardsView] = useState("normal");
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [highestCardIndex, setHighestCardIndex] = useState(0);
  const { setIsAddCardModalOpen, setEditId, setDefaultValues } =
    useModalsStates();
  const { isOnline } = useNetwork();
  const [hasOfflineData, setHasOfflineData] = useState(true);
  const { getCards } = useDb(user?._id);

  const storedUserId = localStorage.getItem("userId");
  const offlineDb = useDb(storedUserId || user?._id);

  useEffect(() => {
    const checkOfflineData = async () => {
      if (!isOnline && offlineDb) {
        const cards = await offlineDb.getCards();
        setHasOfflineData(!!cards?.length);
      }
    };
    checkOfflineData();
  }, [isOnline, offlineDb]);

  // Search sidebar state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { editor, setContent } = useUseEditor(true);
  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () =>
      axios
        .get(`collection/${collectionId}`)
        .then((res) => res.data as CollectionType),
    enabled: !!collectionId,
  });
  const { updateCard } = useDb(user?._id);

  useEffect(() => {
    const nav = document.querySelector("nav");
    if (nav) nav.style.display = "none";
    return () => {
      if (nav) nav.style.display = "flex";
    };
  }, []);

  const {
    userCards: cardsToStudy,
    cardsCount,
    fetchNextPage,
    isFetching,
  } = useGetCards({
    collectionId,
    study: "all",
    difficultyFilter,
  });

  const [isLoading, setIsLoading] = useState(false);

  const card = cardsToStudy?.[currentCard];

  const updatedCardsRef = useRef<CardType[]>([]);

  const cardsLoading = isFetching || isLoading;

  const sendLocalCardsToBackend = () => {
    // Send the full card data to the server
    const cardsToUpdate = updatedCardsRef.current.map((update) => ({
      ...update,
      stability: update.stability ?? 0,
      difficulty: update.difficulty ?? 0.3,
      elapsed_days: update.elapsed_days ?? 0,
      scheduled_days: update.scheduled_days ?? 0,
      learning_steps: update.learning_steps ?? 0,
      reps: update.reps ?? 0,
      lapses: update.lapses ?? 0,
      state: update.state ?? SRS.States.NEW,
      // Ensure dates are properly formatted as ISO strings
      last_review: new Date(update.last_review || Date.now()).toISOString(),
      due: new Date(update.due || Date.now()).toISOString(),
      reviewCount: update.reviewCount ?? 0,
    }));

    if (cardsToUpdate.length === 0) {
      console.log("No cards to update");
      return;
    }

    console.log("Sending batch update:", cardsToUpdate);
    setIsLoading(true);
    axios
      .patch(`card/batch`, {
        toUpdateCardsData: cardsToUpdate,
      })
      .then(() => {
        console.log("✅ Synced on normal exit");
        updatedCardsRef.current = [];
        localStorage.removeItem("unsyncedCards");
        // Invalidate queries to ensure updates are reflected
        queryClient.invalidateQueries({
          queryKey: ["cards", user?._id, "study"],
        });
      })
      .catch((error) => {
        console.warn(
          "⚠️ Sync failed on normal exit — keeping local copy",
          error
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    // Load any unsynced cards from previous sessions
    const loadUnsyncedCards = () => {
      const unsyncedCards = JSON.parse(
        localStorage.getItem("unsyncedCards") || "[]"
      );
      if (unsyncedCards.length > 0) {
        updatedCardsRef.current = unsyncedCards;
      }
    };

    loadUnsyncedCards();

    const handleBeforeUnload = () => {
      if (updatedCardsRef.current.length > 0) {
        localStorage.setItem(
          "unsyncedCards",
          JSON.stringify(updatedCardsRef.current)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (updatedCardsRef.current.length > 0) {
        sendLocalCardsToBackend();
      } else {
        localStorage.removeItem("unsyncedCards");
      }
    };
  }, []);

  const submitAnswer = async (answer = "") => {
    if (!cardsToStudy?.length || !card || !cardsCount) return;

    // Map the answer to SRS rating
    let rating;
    switch ((answer || "").toLowerCase()) {
      case "again":
        rating = SRS.Rating.Again;
        break;
      case "hard":
        rating = SRS.Rating.Hard;
        break;
      case "medium":
        rating = SRS.Rating.Good;
        break;
      case "easy":
        rating =
          card.state === SRS.States.NEW ? SRS.Rating.Good : SRS.Rating.Easy;
        break;
      default:
        rating = SRS.Rating.Good;
    }

    // Calculate new card values using SRS
    const cardForCalculation = {
      stability: card.stability ?? 0,
      difficulty: card.difficulty ?? 0.3,
      elapsed_days: card.elapsed_days ?? 0,
      scheduled_days: card.scheduled_days ?? 0,
      learning_steps: card.learning_steps ?? 0,
      reps: card.reps ?? 0,
      lapses: card.lapses ?? 0,
      state: card.state ?? 0,
      last_review: card.last_review ?? new Date(),
      due: card.due ?? new Date(),
    };

    const updatedCardValues = SRS.calculateNextInterval(
      cardForCalculation,
      rating
    );

    // Create update object with calculated values
    const update = {
      _id: card._id,
      answer,
      ...updatedCardValues,
      reviewCount: (card.reviewCount || 0) + 1,
    };

    updatedCardsRef.current.push(update);
    updateCard(update).catch((err) =>
      console.error("Failed to update Dexie card", err)
    );

    const existing = JSON.parse(localStorage.getItem("unsyncedCards") || "[]");

    // Remove any previous update for the same card
    const filtered = existing.filter((c: any) => c._id !== update._id);

    // Add the latest update
    filtered.push(update);

    // Save back to localStorage
    localStorage.setItem("unsyncedCards", JSON.stringify(filtered));

    setShowAnswer(false);
    setCurrentCard((pre) => {
      const nextIndex = pre + 1;
      if (nextIndex > highestCardIndex) setHighestCardIndex(nextIndex);

      if (pre >= cardsToStudy.length - 1) {
        navigate("/congrats", { replace: true });
        return pre;
      } else {
        if (pre === cardsToStudy.length - 20) fetchNextPage();
        return nextIndex;
      }
    });
  };

  const [voice, setVoice] = useState<any>();

  const { languages, voices } = useVoices();

  useEffect(() => {
    if (voices.length > 0) {
      setVoice(voices[0]); // Set the first available voice as default
    }
  }, [voices]);

  const navigateForward = () => {
    setShowAnswer(false);
    if (!cardsToStudy) return;
    if (
      currentCard < highestCardIndex &&
      currentCard < cardsToStudy.length - 1
    ) {
      setCurrentCard(currentCard + 1);
      if (currentCard + 1 !== highestCardIndex) setShowAnswer(true); // Always show answer when navigating forward
    }
  };

  const navigateBackwards = () => {
    setShowAnswer(false);

    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(true); // Always show answer when navigating back
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAnswer) {
        if (e.key === "1") {
          submitAnswer("easy");
        } else if (e.key === "2") {
          submitAnswer("medium");
        } else if (e.key === "3") {
          submitAnswer("hard");
        } else if (e.key === "4") {
          submitAnswer("again");
        }
      }

      if (e.code === "ArrowRight") {
        navigateForward();
      }
      if (e.code === "ArrowLeft") {
        navigateBackwards();
      }

      if (e.code === "Space" || e.key === "Enter") {
        if (!showAnswer) {
        }
        setShowAnswer(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitAnswer, showAnswer, currentCard, highestCardIndex, cardsToStudy]);

  useEffect(() => {
    if (cardsToStudy) setContent(cardsToStudy[currentCard]?.content || "");
  }, [currentCard]);

  const [studyMode, setStudyMode] = useState<"all" | "due">("due");

  const now = new Date();
  const dueCards =
    cardsToStudy?.filter((card) => new Date(card.due) <= now) || [];
  const notDueCards =
    cardsToStudy?.filter((card) => new Date(card.due) > now) || [];

  const visibleCards = studyMode === "due" ? dueCards : cardsToStudy;

  console.log("cardsLoading", cardsLoading);
  if (collectionLoading || cardsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[rgba(173,150,255,0.08)]">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col justify-center items-center p-8 mb-4 bg-white rounded-2xl shadow-md">
            <Skeleton className="mb-6 w-3/4 h-12" />
            <Skeleton className="mb-4 w-full h-32" />
            <div className="flex gap-4 justify-center mt-4 w-full">
              <Skeleton className="w-24 h-10" />
              <Skeleton className="w-24 h-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(173,150,255,0.08)]">
      <AddCardModal />
      {!isOnline && (
        <div className="container flex gap-2 justify-center items-center text-center text-amber-800 bg-amber-50 border-b border-amber-100">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">
            You're currently offline. Your progress will be synced when you
            reconnect.
          </span>
        </div>
      )}
      <SearchSidebar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        collectionId={collectionId}
      />
      <div className="w-full bg-white shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div className="px-3 py-1 text-sm font-medium bg-gray-100 rounded-md">
                {currentCard > cardsCount - 1 ? cardsCount : currentCard + 1} /{" "}
                {cardsCount}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {collection?.name || "All cards"}
              </h3>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 rounded-full transition-colors hover:text-gray-900 hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  navigate(-1);
                }}
              >
                <BsXCircleFill size="30" style={{ color: "red" }} />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-hidden relative w-full h-1 bg-gray-200">
          <motion.div
            className="absolute top-0 left-0 h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{
              width: `${
                (((currentCard > cardsCount - 1
                  ? cardsCount
                  : currentCard + 1) / cardsCount) as number) * 100
              }%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              width: `${
                (((currentCard > cardsCount - 1
                  ? cardsCount
                  : currentCard + 1) / cardsCount) as number) * 100
              }%`,
            }}
          />
        </div>
      </div>
      <div className="container sm:!px-4">
        {!cardsToStudy?.length ? (
          <div className="container py-12 mx-auto text-center">
            <p className="text-lg text-gray-600">
              There are no cards with these filters
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              key={currentCard}
              className="overflow-hidden relative mt-4 mb-8 w-full max-w-[80%] sm:max-w-none mx-auto bg-white rounded-2xl shadow-md"
            >
              {/* Card content */}
              <div className="p-8 min-h-[600px] flex flex-col w-full relative">
                {/* Front of card */}
                <div className="flex justify-between items-start mb-6">
                  <div className="text-sm font-medium text-gray-500">
                    {studyCardsView === "normal" ? "Term" : "Definition"}
                  </div>
                  <div className="flex gap-3 items-center">
                    <TextToSpeech
                      text={
                        studyCardsView === "normal"
                          ? cardsToStudy[currentCard]?.front
                          : cardsToStudy[currentCard]?.back
                      }
                      autoPlay={isAudioMode}
                    />

                    {/* Settings button */}
                    <div className="">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="py-2 bg-white rounded-full shadow-sm transition-colors hover:bg-gray-50">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full max-w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Study Settings
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Customize your study experience
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                  <label
                                    className="text-sm font-medium"
                                    htmlFor="study-mode"
                                  >
                                    Study Mode
                                  </label>
                                  <Select
                                    value={studyCardsView}
                                    onValueChange={(value) =>
                                      setStudyCardsView(value)
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="normal">
                                        Normal
                                      </SelectItem>
                                      <SelectItem value="reversed">
                                        Reversed
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-between items-center">
                                  <label
                                    className="text-sm font-medium"
                                    htmlFor="difficulty"
                                  >
                                    Difficulty Filter
                                  </label>
                                  <Select
                                    value={difficultyFilter}
                                    onValueChange={(value) =>
                                      setDifficultyFilter(value)
                                    }
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">
                                        All Cards
                                      </SelectItem>
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="medium">
                                        Medium
                                      </SelectItem>
                                      <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-between items-center">
                                  <label
                                    className="text-sm font-medium"
                                    htmlFor="audio-mode"
                                  >
                                    Audio Mode
                                  </label>
                                  <input
                                    type="checkbox"
                                    id="audio-mode"
                                    checked={isAudioMode}
                                    onChange={(e) =>
                                      setIsAudioMode(e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <button
                      onClick={() => {
                        setDefaultValues({
                          ...card,
                        });

                        setIsAddCardModalOpen(true);
                        setEditId(card._id);
                      }}
                    >
                      <Edit3Icon fontSize={14} />
                    </button>
                  </div>
                </div>
                <motion.div
                  className="flex flex-col flex-grow justify-center items-center p-4 text-center rounded-lg transition-colors cursor-pointer"
                  onClick={() => !showAnswer && setShowAnswer(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!isAudioMode && (
                    <div className="mb-4">
                      <p className="mb-2 text-2xl font-semibold">
                        {studyCardsView === "normal"
                          ? cardsToStudy[currentCard]?.front
                          : cardsToStudy[currentCard]?.back}
                      </p>
                      <div className="flex gap-2 justify-center items-center">
                        <Button
                          tabIndex={-1}
                          className="flex gap-1 items-center px-0 w-10 h-10 text-gray-600 rounded-full border-gray-300 transition-colors hover:bg-gray-100"
                          variant="primary-outline"
                          onClick={navigateBackwards}
                          disabled={currentCard === 0}
                        >
                          <ChevronLeft size={18} />
                        </Button>

                        {/* {cardsToStudy[currentCard]?.easeFactor !==
                          undefined && (
                          <div
                            className={`px-3 py-1 !w-fit  rounded-md text-sm font-medium ${
                              cardsToStudy[currentCard].easeFactor >= 0.75
                                ? "bg-green-100 text-green-800"
                                : cardsToStudy[currentCard].easeFactor >= 0.5
                                ? "bg-yellow-100 text-yellow-800"
                                : cardsToStudy[currentCard].easeFactor > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cardsToStudy[currentCard].easeFactor >= 0.75
                              ? "Easy"
                              : cardsToStudy[currentCard].easeFactor >= 0.5
                              ? "Medium"
                              : cardsToStudy[currentCard].easeFactor > 0
                              ? "Hard"
                              : "New"}
                          </div>
                        )} */}

                        <Button
                          tabIndex={-1}
                          className="flex gap-1 items-center px-0 w-10 h-10 text-gray-600 rounded-full transition-colors border-gray-240 hover:bg-gray-100"
                          variant="primary-outline"
                          onClick={navigateForward}
                          disabled={
                            currentCard >= highestCardIndex ||
                            currentCard >= cardsToStudy.length - 1
                          }
                        >
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  )}
                  {!showAnswer && (
                    <p className="text-sm text-gray-400">
                      Click to reveal answer
                    </p>
                  )}
                </motion.div>

                {/* Answer section */}
                <AnimatePresence mode="wait">
                  {showAnswer ? (
                    <motion.div
                      className="pt-6 mt-6 border-t border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-sm font-medium text-gray-500"></div>
                        <TextToSpeech
                          text={
                            studyCardsView === "normal"
                              ? cardsToStudy[currentCard]?.back
                              : cardsToStudy[currentCard]?.front
                          }
                        />
                      </div>
                      <div className="mb-6 text-lg">
                        {studyCardsView === "normal"
                          ? cardsToStudy[currentCard]?.back
                          : cardsToStudy[currentCard]?.front}
                      </div>

                      <TipTapEditor editor={editor} />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="pt-6 mt-6 text-center border-t border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="mb-4 text-sm text-gray-500">
                        TRY GUESSING FIRST, THEN CLICK ON THE CARD OR
                      </p>
                      <Button onClick={() => setShowAnswer(true)}>
                        <span className="mr-2 bg-white text-primary px-2 py-0.5 rounded text-xs font-bold">
                          SPACE
                        </span>
                        To reveal the answer{" "}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {showAnswer && (
                <motion.div
                  className="flex gap-2 justify-between px-6 py-4 bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    tabIndex={-1}
                    className="flex-1 h-10 text-green-600 border-green-600 transition-colors hover:bg-green-600 hover:text-white"
                    variant="primary-outline"
                    onClick={() => submitAnswer("easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    tabIndex={-1}
                    className="flex-1 h-10 text-yellow-600 border-yellow-600 transition-colors hover:bg-yellow-600 hover:text-white"
                    variant="primary-outline"
                    onClick={() => submitAnswer("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    tabIndex={-1}
                    className="flex-1 h-10 text-red-600 border !border-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    variant="danger-outline"
                    onClick={() => submitAnswer("hard")}
                  >
                    Hard
                  </Button>
                  <Button
                    tabIndex={-1}
                    className="flex-1 h-10 text-gray-700 border-gray-700 transition-colors hover:bg-gray-700 hover:text-white"
                    variant="primary-outline"
                    onClick={() => submitAnswer(`again`)}
                  >
                    Again
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default StudyCards;
