import React from "react";
import { Search as SearchIcon } from "lucide-react";

type SearchProps = {
  query: string;
  searchingFor: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

const Search = React.memo(function Search({
  query,
  searchingFor,
  setQuery,
}: SearchProps) {
  return (
    <div className="relative w-full">
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <SearchIcon className="w-4 h-4 text-gray-500" />
      </div>
      <input
        type="text"
        className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a3aa5] focus:border-transparent"
        placeholder={`Search in ${searchingFor}`}
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
      />
    </div>
  );
});

export default Search;
