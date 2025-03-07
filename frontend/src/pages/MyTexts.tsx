import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import axios from "axios";
import Search from "../components/Search";
import Button from "../components/Button";
import SelectedItemsController from "../components/SelectedItemsController";
import Actions from "../components/ActionsDropdown";
import { Link, useNavigate } from "react-router-dom";
import ActionsDropdown from "../components/ActionsDropdown";
import useModalsStates from "@/hooks/useModalsStates";
import SelectCheckBox from "@/components/SelectCheckBox";
import ItemCard from "@/components/ui/ItemCard";
import { Text } from "lucide-react";
import { text } from "stream/consumers";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
// import AddNewTextModal from "@/components/AddNewTextModal";

export type TextType = {
  title: string;
  content: string;
  defaultCollectionId: string | undefined;
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
      return response.data as (TextType & { _id: string })[];
    },
  });
  const queryClient = useQueryClient();

  const invalidateTextQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["texts"] });
    queryClient.invalidateQueries({ queryKey: ["text"] });
  };
  const deleteTextHandler = async (id: string) => {
    const deleteRes = await axios.delete(`text/${id}`).then(() => {
      invalidateTextQueries();
    });
    return;
  };

  const { setEditId, setIsTextModalOpen } = useModalsStates();

  const navigate = useNavigate();
  const editHandler = (text: TextType & { _id: string }) => {
    setEditId(text._id);
    navigate("/texts/edit/" + text._id);
    setIsTextModalOpen(true);
  };

  return (
    <div className="container">
      <h1 className="my-6 text-5xl font-bold text-black">Texts</h1>

      {/* <AddNewTextModal /> */}
      <>
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Number of texts : {texts?.length}
        </h6>

        <Button
          onClick={() => navigate("/texts/new")}
          className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none "
        >
          Add new text
        </Button>

        <SelectedItemsController isItemsTexts={true} />

        <div className="grid gap-4 grid-container">
          {texts.map((text) => (
            <ItemCard
              Icon={<Text />}
              editHandler={() => editHandler(text)}
              deleteHandler={() => deleteTextHandler(text._id)}
              name={text.title}
              key={text._id}
              id={text._id}
            />
          ))}

          {isLoading && <CollectionSkeleton />}
        </div>
      </>
    </div>
  );
};

export default MyTexts;
