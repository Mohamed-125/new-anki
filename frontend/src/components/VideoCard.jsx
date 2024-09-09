import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Actions from "./Actions";

const VideoCard = ({
  video,
  deleteHandler,
  setActionsDivId,
  isActionDivOpen,
}) => {
  return (
    <div className="bg-white flex flex-col gap-2 mb-2 rounded-mdtext-wrap">
      <Link
        to={"/video/" + video._id}
        className="cursor-pointer  overflow-hidden "
      >
        <img className="w-full" src={video.thumbnail} />
      </Link>
      <div className="py-6 px-4 grow flex gap-2">
        {video.title}
        <Actions
          id={video._id}
          deleteHandler={deleteHandler}
          isVideo={true}
          setActionsDivId={setActionsDivId}
          isActionDivOpen={isActionDivOpen}
        />{" "}
      </div>
    </div>
  );
};

export default VideoCard;
