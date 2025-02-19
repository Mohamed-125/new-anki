import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import axios from "axios";
import Search from "../components/Search";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import Actions from "../components/Actions";
import { Link, useNavigate } from "react-router-dom";

export type TextType = {
  title: string;
  content: string;
  _id?: string;
};

const MyTexts = () => {
  const {
    data: texts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["text"],
    queryFn: async () => {
      const response = await axios.get("text");
      return response.data;
    },
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<TextType[]>([]);
  const [actionsDivId, setActionsDivId] = useState("");

  const deleteTextHandler = async (id: string) => {
    setFilteredTexts((pre) => pre.filter((item) => item?._id !== id));
    const deleteRes = await axios.delete(`text/${id}`);
  };

  const navigate = useNavigate();

  if (isLoading) return <Loading />;

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Texts</h1>

      {texts?.length ? (
        <>
          <Search
            setState={setFilteredTexts}
            label={"Search your text"}
            items={texts}
            filter={"title"}
          />

          <h6 className="mt-4 text-lg font-bold text-gray-400">
            Number of texts : {texts?.length}
          </h6>

          <Link to="/add-text">
            <Button className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none ">
              Add new text
            </Button>
          </Link>

          <SelectedItemsController
            isItemsTexts={true}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setItemsState={setFilteredTexts}
          />

          <div className="grid gap-4 grid-container">
            {filteredTexts.map((text) => (
              <div
                key={text._id}
                className="bg-white py-4 px-3 min-h-[100px] flex items-center rounded-md"
              >
                <input
                  checked={selectedItems.includes(text._id as string)}
                  type="checkbox"
                  className="!min-w-6 !h-6 mr-4"
                  onChange={(e) => {
                    //@ts-ignore
                    setSelectedItems((pre) => {
                      if (e.target.checked) {
                        return [...pre, text._id];
                      } else {
                        return [...pre.filter((item) => item !== text._id)];
                      }
                    });
                  }}
                />{" "}
                <div className="flex justify-between gap-1 grow">
                  <div>
                    <Link to={`/myTexts/${text._id}`}>
                      <h2>{text.title}</h2>
                    </Link>
                  </div>
                  <div className="ml-auto">
                    <Actions
                      navigateTo={() => {
                        navigate(`/edit-text/${text._id}`);
                      }}
                      id={text._id as string}
                      deleteHandler={deleteTextHandler}
                      setActionsDivId={setActionsDivId}
                      isActionDivOpen={actionsDivId === text._id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Search.NotFound
            state={filteredTexts}
            searchFor={"text"}
            filter={"title"}
          />
        </>
      ) : (
        <Link to="/add-text">
          <Button className="py-4 my-6 mr-0 text-white bg-blue-600 border-none ">
            No text found. Click here to add new Text
          </Button>
        </Link>
      )}
    </div>
  );
};

export default MyTexts;
