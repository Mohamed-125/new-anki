import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { CollectionType } from "../hooks/useGetCollections";
import useGetCards, { CardType } from "../hooks/useGetCards";
import Button from "../components/Button";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { HiMiniSpeakerWave } from "react-icons/hi2";
// @ts-ignore
import { useSpeechSynthesis } from "react-speech-kit";
import Form from "../components/Form";
import ReactQuillComponent from "../components/ReactQuillComponent";

const StudyCards = () => {
  const collectionId = useParams()?.collectionId;
  const navigate = useNavigate();

  console.log("collectionId", collectionId, !collectionId);
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
    data: allCards,
    isLoading: allCardsLoading,
    isError,
  } = useGetCards(!collectionId);

  console.log("allCards", allCards);
  // Determine loading state
  const isLoading = collectionId ? collectionLoading : allCardsLoading;

  const arr = collectionId ? collection?.collectionCards : allCards;
  const unorderedCards = arr?.length ? [...arr] : [];

  const cards = useMemo(() => {
    return unorderedCards?.sort(
      (a: CardType, b: CardType) => a?.easeFactor - b?.easeFactor
    );
  }, [unorderedCards]);

  const submitAnswer = async (answer = "") => {
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
      if (pre === cards.length - 1) {
        navigate("/congrats", { replace: true });
        return pre;
      } else {
        return pre + 1;
      }
    });
  };

  const { speak, voices, speaking, cancel } = useSpeechSynthesis();

  const [voice, setVoice] = useState<any>();

  useEffect(() => {
    if (voices.length > 0) {
      setVoice(voices[0]); // Set the first available voice as default
    }
  }, [voices]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container study-cards__div min-h-[90vh] flex justify-center flex-col mt-7">
      <h3 className="title">{collection?.name || "All cards"}</h3>

      <div className="flex items-center gap-3 mb-6">
        <div className="px-6 py-2 rounded-lg bg-light-gray min-w-fit w-fit">
          {currentCard + 1} / {cards?.length}{" "}
        </div>
        <div
          className="w-full h-5 relative progress__bar before:rounded-2xl rounded-xl bg-light-gray before:[content:''] before:bg-greenColor before:absolute before:left-0 before:h-full before:block"
          style={
            {
              "--width": `${(currentCard / cards?.length) * 100}%`,
            } as React.CSSProperties
          }
        ></div>
      </div>

      <div>
        <p className="text-xl font-semibold text-center">
          {cards[currentCard].front}
        </p>
        <hr className="mt-8" />
        <div className="flex flex-col items-center justify-center gap-2">
          <Form.Field className="flex gap-2 mt-11">
            <label>Voice:</label>
            <Form.Select
              value={voice?.name}
              onChange={(e) => {
                setVoice(() =>
                  voices.find((voice: any) => voice.name === e.target.value)
                );
              }}
            >
              {voices.map((voice: any) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
          <HiMiniSpeakerWave
            className="mb-6 text-5xl cursor-pointer hover:scale-110 "
            onClick={() => {
              if (speaking) {
                cancel();
              }
              speak({ text: cards[currentCard].front, voice });
            }}
          />
        </div>

        {showAnswer && (
          <div className="mt-5 text-lg text-center">
            <p className="mb-7">{cards[currentCard].back}</p>{" "}
            <ReactQuillComponent
              readOnly={true}
              content={cards[currentCard].content}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-auto">
        {showAnswer ? (
          <>
            <Button
              className="block text-green-500 border-green-500 hover:bg-green-500"
              variant="primary-outline"
              onClick={() => submitAnswer("easy")}
            >
              Easy
            </Button>
            <Button
              className="block text-yellow-500 border-yellow-500 text hover:bg-yellow-500"
              variant="primary-outline"
              onClick={() => submitAnswer("medium")}
            >
              Medium
            </Button>
            <Button
              className="block"
              variant="danger-outline"
              onClick={() => submitAnswer("hard")}
            >
              Hard
            </Button>
            <Button
              className="block text-black border-black text hover:bg-black "
              variant="primary-outline"
              onClick={() => submitAnswer(`Couldn't Remember`)}
            >
              Couldn't Remember
            </Button>
          </>
        ) : (
          <Button
            className="block mx-auto mt-auto"
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudyCards;