import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { CollectionType } from "@/hooks/useGetCollections";
import useGetCards from "../hooks/useGetCards";
import Button from "../components/Button";
import { HiMiniSpeakerWave } from "react-icons/hi2";
// @ts-ignore
import { useSpeech, useVoices } from "react-text-to-speech";
import Form from "../components/Form";
import TipTapEditor from "../components/TipTapEditor";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const StudyCards = () => {
  const collectionId = useParams()?.collectionId;
  const navigate = useNavigate();

  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Define the query for when `collectionId` exists
  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () =>
      axios
        .get(`collection/${collectionId}`)
        .then((res) => res.data as CollectionType),
    enabled: !!collectionId, // Query only runs if `collectionId` is not null or undefined
  });

  // Define the query for when `collectionId` does not exist
  const {
    userCards: cards,
    cardsCount,
    fetchNextPage,
    isFetchingNextPage,
    isIntialLoading,
  } = useGetCards({ collectionId, study: true });

  // Determine loading state
  const isLoading = isIntialLoading;

  const submitAnswer = async (answer = "") => {
    if (!cards?.length) return;
    if (cards[currentCard].easeFactor === undefined || !cardsCount) return;

    let easeFactor =
      answer === "easy"
        ? +cards[currentCard].easeFactor + 0.25
        : answer === "medium"
        ? +cards[currentCard].easeFactor + 0.16
        : answer === "hard"
        ? +cards[currentCard].easeFactor - 0.25
        : 0;

    easeFactor = easeFactor > 1 ? 1 : easeFactor < 0 ? 0 : easeFactor;

    const res = await axios.put(`card/${cards[currentCard]._id}`, {
      easeFactor,
    });
    setShowAnswer(false);
    setCurrentCard((pre) => {
      if (pre === cardsCount - 1) {
        navigate("/congrats", { replace: true });
        return pre;
      } else {
        if (pre === cards.length - 4) {
          fetchNextPage();
        }
        return pre + 1;
      }
    });
  };
  const [voice, setVoice] = useState<any>();

  const {
    Text, // Component that returns the modified text property
    speechStatus, // String that stores current speech status
    isInQueue, // Boolean that stores whether a speech utterance is either being spoken or present in queue
    start, // Function to start the speech or put it in queue
    pause, // Function to pause the speech
    stop, // Function to stop the speech or remove it from queue
  } = useSpeech({ text: cards && cards[currentCard]?.front, voiceURI: voice });

  const { languages, voices } = useVoices();

  console.log(voices);
  useEffect(() => {
    if (voices.length > 0) {
      setVoice(voices[0]); // Set the first available voice as default
    }
  }, [voices]);

  //  add the space event listener to show the answer when pressing space

  useEffect(() => {
    const checkSpace = (e: KeyboardEvent) => {
      console.log(e);
      if (e.code === "Space") {
        if (!showAnswer) {
        }
        setShowAnswer(true);
      }
    };

    document.body.addEventListener("keypress", checkSpace);

    return () => {
      document.body.removeEventListener("keypress", checkSpace);
    };
  }, []);

  const [studyCardsView, setStudyCardsView] = useState("normal");

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container flex flex-col min-h-[calc(100vh-170px)] mt-3 study-cards__div">
      <div className="flex items-center justify-between mb-7">
        <h3 className="title">{collection?.name || "All cards"}</h3>

        <SelectGroup>
          <SelectLabel>Select Study Card Mode</SelectLabel>
          <Select
            value={studyCardsView}
            onValueChange={(value) => {
              setStudyCardsView(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </SelectGroup>
      </div>

      {!cards?.length || !cardsCount ? (
        <Loading />
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="px-6 py-2 rounded-lg bg-light-gray min-w-fit w-fit">
              {currentCard + 1} / {cardsCount}{" "}
            </div>
            <div
              className="w-full h-5 relative progress__bar before:rounded-2xl rounded-xl bg-light-gray before:[content:''] before:bg-greenColor before:absolute before:left-0 before:h-full before:block"
              style={
                {
                  "--width": `${(currentCard / cardsCount) * 100}%`,
                } as React.CSSProperties
              }
            ></div>
          </div>

          <div>
            <p className="text-xl font-semibold text-center">
              {studyCardsView === "normal"
                ? cards[currentCard].front
                : cards[currentCard].back}
            </p>
            <hr className="mt-8" />
            <div className="flex flex-col items-center justify-center gap-2">
              <Form.Field className="flex gap-2 mt-11">
                <label>Voice:</label>
                <Form.Select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {voices
                    // .filter((voice) => !lang || voice.lang === lang)
                    .map(({ voiceURI }) => (
                      <option key={voiceURI} value={voiceURI}>
                        {voiceURI}
                      </option>
                    ))}
                </Form.Select>
              </Form.Field>
              <HiMiniSpeakerWave
                className="mb-6 text-5xl cursor-pointer hover:scale-110 "
                onClick={() => {
                  if (speechStatus) {
                    stop();
                  }
                  start();
                }}
              />
            </div>

            {showAnswer && (
              <div className="mt-5 text-lg text-center">
                <p className="mb-7">
                  {studyCardsView === "normal"
                    ? cards[currentCard].back
                    : cards[currentCard].front}
                </p>{" "}
                <TipTapEditor
                  readOnly={true}
                  content={cards[currentCard].content || ""}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center flex-1 w-full h-full gap-2 ">
            {showAnswer ? (
              <>
                <Button //@ts-ignore
                  tabIndex="-1"
                  className="block mt-auto text-green-500 border-green-500 h-11 hover:text-white sm:w-full hover:bg-green-500"
                  variant="primary-outline"
                  onClick={() => submitAnswer("easy")}
                >
                  Easy
                </Button>
                <Button //@ts-ignore
                  tabIndex="-1"
                  className="block mt-auto text-yellow-500 border-yellow-500 h-11 hover:text-white sm:w-full text hover:bg-yellow-500"
                  variant="primary-outline"
                  onClick={() => submitAnswer("medium")}
                >
                  Medium
                </Button>
                <Button //@ts-ignore
                  tabIndex="-1"
                  className="block mt-auto hover:text-white h-11 sm:w-full"
                  variant="danger-outline"
                  onClick={() => submitAnswer("hard")}
                >
                  Hard
                </Button>
                <Button //@ts-ignore
                  tabIndex="-1"
                  className="block mt-auto text-black border-black h-11 hover:text-white sm:w-full text hover:bg-black "
                  variant="primary-outline"
                  onClick={() => submitAnswer(`Couldn't Remember`)}
                >
                  Couldn't Remember
                </Button>
              </>
            ) : (
              <Button
                className="block mx-auto mt-auto h-11 sm:w-full"
                //@ts-ignore
                tabIndex="-1"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudyCards;
