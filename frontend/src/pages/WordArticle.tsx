import React from "react";

const WordArticle = () => {
  // TODO if you want you can send the request to the article website be sending request to the die , der , das endpoints and if the word is found it will be returned

  return (
    <div className="min-h-screen">
      <iframe
        src="https://der-artikel.de/"
        className="w-full h-screen"
      ></iframe>
    </div>
  );
};

export default WordArticle;
