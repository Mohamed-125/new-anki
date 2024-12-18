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
  return (
    <select
      name="video_subtitle"
      value={value}
      onChange={(e) => {
        console.log(e.target.value);
        setValue?.(e.target.value);
      }}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    >
      {availableCaptions?.map((caption, index) => (
        <option value={caption.id} key={index}>
          {caption.name +
            `${caption.isAutoGenerated ? " (auto-generated)" : ""}`}
        </option>
      ))}
    </select>
  );
};

export default AvailableCaptionsSelect;
