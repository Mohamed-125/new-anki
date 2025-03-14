import React, { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select from "react-select";
import Button from "./Button";
import { SingleValue } from "react-select";

type ChangeItemsParentProps = {
  changeItemsParent: boolean;
  itemsType: string;
  itemsIds: string[];
  parentName: string;
  setChangeItemsParent: React.Dispatch<React.SetStateAction<boolean>>;
};

type OptionType = { value: string; label: string };

const ChangeItemsParent = ({
  changeItemsParent,
  itemsType,
  itemsIds,
  parentName,
  setChangeItemsParent,
}: ChangeItemsParentProps) => {
  const [selectedParent, setSelectedParent] = useState("");
  const [options, setOptions] = useState<OptionType[]>([]);

  const {
    data,
    isLoading: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`${parentName}s`],
    queryFn: () => axios.get(parentName).then((res) => res.data),
  });

  useEffect(() => {
    if (!data || data.length) return;
    const options: OptionType[] = data?.map(
      (item: { _id: string; name: string }) => ({
        value: item._id,
        label: item.name,
      })
    );

    options?.unshift({ value: "", label: `Remove from any ${parentName}` });
    setOptions(options);
  }, [data]);

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (selectedParent: string) => {
      const res = await axios.post(`${itemsType}/batch-move`, {
        ids: itemsIds,
        selectedParent,
      });

      res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${parentName}s`] });
      setChangeItemsParent(false);
    },
  });
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedParent) {
      mutateAsync(selectedParent).catch((err) => {
        console.error("Error in mutation:", err);
      });
    } else {
      console.error("No parent selected");
    }
  };

  return (
    <Modal isOpen={changeItemsParent} setIsOpen={setChangeItemsParent}>
      <Form onSubmit={handleSubmit} className={"max-w-none"}>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>
              Move {itemsType}s to {parentName}
            </Form.Label>
            <Select
              onChange={(e: SingleValue<OptionType>) => {
                if (e) {
                  setSelectedParent(e.value);
                }
              }}
              options={options}
              placeholder={`Select the move to ${parentName}`}
              defaultValue={options?.[0]}
            />
          </Form.Field>
        </Form.FieldsContainer>

        <div className="flex gap-2">
          <Button
            onClick={() => setChangeItemsParent(false)}
            size="parent"
            type="button"
            variant={"danger"}
            className={"mt-8"}
          >
            Cancel
          </Button>{" "}
          <Button size="parent" className={"mt-8"}>
            Move{" "}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangeItemsParent;
