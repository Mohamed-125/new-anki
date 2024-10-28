import React from "react";
import Button from "../components/Button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useNavigate } from "react-router-dom";

const Congrats = () => {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();

  return (
    <div className="container grid h-screen place-content-center">
      <Confetti width={width} height={height} />
      <h5 className="text-center title ">Congratulations</h5>
      <p className="text-center text-gray">
        You Have Studied All Of The Cards!
      </p>
      <Button
        className="mx-auto mt-9"
        onClick={() => {
          navigate(-1);
        }}
      >
        Go Back To The Previous Page
      </Button>
    </div>
  );
};

export default Congrats;
