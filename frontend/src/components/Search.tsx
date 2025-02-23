import React, { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import Form from "./Form";

type SearchProps<T extends { [key: string]: any }, K> = {
  items: T[];
  setState: any;
  filter: keyof T;
  filter2?: any;
  label: string;
};

function Search<T extends { [key: string]: any }, K>({
  items,
  setState,
  filter,
  label,
  filter2,
}: SearchProps<T, K>) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) {
      const filterOneArr = items?.filter((item) => {
        return item[filter]
          .toLowerCase()
          .trim()
          .includes(debouncedQuery.toLowerCase().trim());
      });
      console.log(filterOneArr);

      if (filterOneArr?.length > 0) {
        setState(filterOneArr);
      } else {
        const filterTwoArr = items?.filter((item) => {
          return item[filter2]
            ?.toLowerCase()
            ?.trim()
            ?.includes(debouncedQuery?.toLowerCase().trim());
        });
        console.log("no first array", filterTwoArr, filter2);

        setState(filterTwoArr);
      }
    } else {
      setState(items);
    }
  }, [debouncedQuery, items]);

  return (
    <Form
      className={
        "flex px-0 py-0  w-full max-w-none text-lg bg-transparent rounded-xl"
      }
    >
      <div className="grow">
        <Form.Label>{label}</Form.Label>
        <Form.Input
          className="py-2 text-black bg-gray-200 rounded-xl"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          name="query"
          placeholder="Search"
        />
      </div>
    </Form>
  );
}

Search.NotFound = <T,>({
  state,
  searchFor,
  filter,
  filter2,
}: {
  state: T[];
  searchFor: string;
  filter: string;
  filter2?: string;
}) => {
  return (
    <>
      {!state?.length ? (
        <p className="text-2xl text-center text-textGray">
          there is no {searchFor} found with this {filter} or {filter2}
        </p>
      ) : null}
    </>
  );
};
export default Search;
