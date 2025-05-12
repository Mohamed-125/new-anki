import { DataTable } from "./data-table";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  return (
    <div className="container py-10 mx-auto">
      <label className="block mb-3 font-semibold text-gray-600">
        Search Users By Email Or Username
      </label>
      <Input className="mb-6" onChange={(e) => setQuery(e.target.value)} />
      <DataTable debouncedQuery={debouncedQuery} />
    </div>
  );
}
