import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LinkType } from "./Navbar";
import useGetCurrentUser, { UserType } from "../hooks/useGetCurrentUser";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { googleLogout } from "@react-oauth/google";
import useGetCourses from "@/hooks/Queries/useGetCourses";
import { useState } from "react";
import {
  Home,
  Folder,
  BookOpen,
  Video,
  ListMusic,
  FileText,
  Library,
  BookMarked,
} from "lucide-react";

type SidebarProps = {
  links: LinkType[];
};

const Sidebar = ({ links }: SidebarProps) => {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/study-cards");

  // Map icons to link names
  const getIconForLink = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Home: <Home className="w-5 h-5" />,
      Collections: <Folder className="w-5 h-5" />,
      Learn: <BookOpen className="w-5 h-5" />,
      videos: <Video className="w-5 h-5" />,
      playlists: <ListMusic className="w-5 h-5" />,
      Notes: <FileText className="w-5 h-5" />,
      "My Texts": <FileText className="w-5 h-5" />,
      Library: <Library className="w-5 h-5" />,
      "word article": <BookMarked className="w-5 h-5" />,
    };

    return iconMap[name] || <Home className="w-5 h-5" />;
  };

  return (
    <>
      {!hideLayout ? (
        <div className="flex relative z-50  w-[35%] flex-col h-screen max-w-60 bg-[#F9F9F9] border-r border-gray-200">
          <div className="p-4">
            <Link to="/" className="flex gap-2 items-center mb-8">
              <h1 className="text-2xl font-bold text-[#5a3aa5]">
                FLASH BRAINS
              </h1>
            </Link>

            <div className="space-y-1">
              {links?.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#ebe7f8] text-[#5a3aa5]"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    to={link.path}
                  >
                    {getIconForLink(link.name)}
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;
