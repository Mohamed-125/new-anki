import React from "react";
import { availableCaption } from "./AddVideoModal";

const AvailableCaptionsSelect = ({
  availableCaptions,
  setValue,
  value,
}: {
  availableCaptions: availableCaption[];
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  value?: string;
}) => {
  console.log("availableCaptions", availableCaptions);
  return (
    <select
      name="video_subtitle"
      value={value}
      onChange={(e) => {
        setValue?.(e.target.value);
      }}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    >
      {availableCaptions?.map((caption, index) => (
        <option value={caption.value} key={index}>
          {caption.text}
        </option>
      ))}
    </select>
  );
};

export default AvailableCaptionsSelect;
