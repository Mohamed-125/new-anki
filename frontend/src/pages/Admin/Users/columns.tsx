import { UserType } from "@/hooks/useGetCurrentUser";
import { ColumnDef } from "@tanstack/react-table";

import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return <div className="flex items-center space-x-2">ID</div>;
    },
    size: 80,
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isAdmin",
    header: ({ column }) => {
      return (
        <div className="">
          <p>Is admin</p>

          <select
            className="px-2 py-1 max-w-sm rounded border"
            onChange={(e) => column.setFilterValue(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Admin</option>
            <option value="false">Not Admin</option>
          </select>
        </div>
      );
    },
  },
  {
    accessorKey: "isPremium",
    header: ({ column }) => {
      return (
        <div className="">
          <p>Is premium</p>
          <select
            className="px-2 py-1 max-w-sm rounded border"
            onChange={(e) => column.setFilterValue(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Premium</option>
            <option value="false">Not Premium</option>
          </select>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",

    cell: ({ row }) => {
      const user = row.original;
      const queryClient = useQueryClient();
      const makeOrRemoveAdmin = () => {
        const answer = window.confirm(
          `Are You Sure You Want To ${
            user.isAdmin
              ? "Remove This User From Being An Admin ?"
              : "You Want To Make This User An Admin"
          }`
        );

        if (!answer) return;
        axios.patch(`/auth/update-profile?userId=${user._id}`, {
          isAdmin: !user?.isAdmin || true,
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      };

      const makePremium = () => {
        const answer = window.confirm(
          `Are You Sure You Want To Make This User a Premium User ? `
        );

        if (!answer) return;
        axios.patch(`/auth/update-profile?userId=${user._id}`, {
          isPremium: !user?.isPremium || true,
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="p-0 w-8 h-8 text-black bg-transparent hover:bg-transparent">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={makeOrRemoveAdmin}>
              {user?.isAdmin ? "Remove Admin" : "Make Admin"}{" "}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!user?.isPremium && (
              <DropdownMenuItem onClick={makePremium}>
                Make Premium
              </DropdownMenuItem>
            )}{" "}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
