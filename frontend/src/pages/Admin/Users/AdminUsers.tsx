import useGetUsers from "@/hooks/useGetUsers";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { UserType } from "@/hooks/useGetCurrentUser";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import useInfiniteScroll from "@/components/InfiniteScroll";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ColumnFilter, ColumnFiltersState } from "@tanstack/react-table";
export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [isAdmin, setIsAdmin] = useState("");
  const [isPremium, setIsPremium] = useState("");

  const { users, isInitialLoading, fetchNextPage, hasNextPage } = useGetUsers({
    query: debouncedQuery,
    isAdmin,
    isPremium,
  });

  useInfiniteScroll(fetchNextPage, hasNextPage);
  const onFilterChange = (filters: ColumnFiltersState) => {
    const isAdminFilter =
      (filters.find((filter) => filter.id === "isAdmin")?.value as string) ||
      "";
    const isPremiumFilter =
      (filters.find((filter) => filter.id === "isPremium")?.value as string) ||
      "";

    setIsAdmin(isAdminFilter);
    setIsPremium(isPremiumFilter);
  };
  return (
    <div className="container py-10 mx-auto">
      <label className="block mb-3 font-semibold text-gray-600">
        Search Users By Email Or Username
      </label>
      <Input className="mb-6" onChange={(e) => setQuery(e.target.value)} />
      <DataTable
        isLoading={isInitialLoading}
        columns={columns}
        data={users || []}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
