import useGetCourses from "@/hooks/Queries/useGetCourses";
import useGetCurrentUser, { UserType } from "@/hooks/useGetCurrentUser";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { googleLogout } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { Menu, X } from "lucide-react";
import logo from "../assets/white logo.png";
import { LinkType } from "./Navbar";
import { cn } from "../lib/utils";

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  links: LinkType[];
}

const Header = ({ setIsMobileOpen, links }: HeaderProps) => {
  const { user } = useGetCurrentUser();
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/study-cards");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (hideLayout) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F9F9] border-b border-gray-200">
      <div className="container flex justify-between items-center px-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex gap-2 items-center">
          <img src={logo} className="block max-w-28" />
        </Link>

        {/* Desktop Nav */}
        <nav className="flex gap-2 items-center md:hidden">
          {links?.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                className={cn(
                  "flex items-center px-1.5 py-1 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#ebe7f8] text-[#5a3aa5]"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                to={link.path}
              >
                {link.name}
              </Link>
            );
          })}

          {user?._id ? (
            <>
              <LanguagesDropdown />
              <ProfileDropdown user={user} />
            </>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden px-0 py-0 text-xl text-gray-500 md:flex"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-8 h-8" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="hidden fixed inset-0 z-50 bg-black/40 md:block">
          <div className="flex fixed top-0 right-0 flex-col p-6 w-3/4 max-w-sm h-full bg-white shadow-lg">
            <div className="flex justify-end items-center mb-6">
              <Button
                variant="outline"
                size="icon"
                className="p-0 border-none"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-8 h-8 text-gray-700" />
              </Button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-3">
              {links?.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium",
                      isActive
                        ? "bg-[#ebe7f8] text-[#5a3aa5]"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {user?._id ? (
                <div className="flex flex-col gap-3 mt-4">
                  <LanguagesDropdown />
                  <ProfileDropdown user={user} />
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

const ProfileDropdown = ({ user }: { user: UserType | null }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutHandler = () => {
    axios.post("auth/logout").then(() => {
      googleLogout();
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
      sessionStorage.removeItem("redirectPath");
      navigate("/login");
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="ml-1 text-2xl">
        <Link to={"/profile/" + user?._id} className="cursor-pointer">
          <div className="flex justify-center items-center w-11 h-11 font-bold text-white bg-sky-900 rounded-full">
            {user?.email?.[0]}
          </div>
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-4 py-5 mt-2 bg-popover">
        <div>
          <strong>{user?.username}</strong>
        </div>
        <div>
          <small>{user?.email}</small>
        </div>
        {user?.isAdmin && (
          <Link className="block mt-3" to={"/admin"}>
            <Button variant="primary-outline">Go To The Admin Panel</Button>
          </Link>
        )}
        <DropdownMenuSeparator className="my-3 h-[2px]" />
        <Button onClick={logoutHandler} variant="danger">
          Logout
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const LanguagesDropdown = () => {
  const { courses, isLoading } = useGetCourses();
  const { user } = useGetCurrentUser();

  const [addLanguages, setAddLanguages] = useState(false);

  const { selectedLearningLanguage, setSelectedLearningLanguage } =
    useGetCurrentUser();

  const queryClient = useQueryClient();

  if (isLoading) return <div>Loading....</div>;

  console.log(courses);
  const filteredLanguages = courses?.filter(
    (course) => !user?.languages.includes(course.lang)
  );

  const addLanguageToUser = (languageToAdd: string) => {
    if (user?.languages)
      axios
        .patch("/auth/update-profile", {
          languages: [...user?.languages, languageToAdd],
        })
        .then((res) => {
          queryClient.setQueryData(["me"], (oldData: any) => {
            return res.data;
          });
        });
  };

  console.log(
    courses?.find((courses) => courses.lang === selectedLearningLanguage)
  );

  console.log(courses);
  return (
    <DropdownMenu
      modal={false}
      onOpenChange={() => {
        setAddLanguages(false);
      }}
    >
      <DropdownMenuTrigger className="ml-1 text-2xl">
        <div className="overflow-hidden w-11 h-11 rounded-full">
          <img
            className="object-cover w-full h-full"
            src={
              courses?.find(
                (courses) => courses.lang === selectedLearningLanguage
              )?.flag
            }
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-4 w-[200px] py-5 mt-2 bg-popover">
        {user?.languages.map((userLanguage) => {
          const language = courses?.find(
            (courses) => courses.lang === userLanguage
          );

          return (
            <>
              <DropdownMenuItem
                key={userLanguage}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedLearningLanguage(userLanguage);
                }}
              >
                <img src={language?.flag} className="w-8 h-8 rounded-full" />{" "}
                <p>{language?.name}</p>
              </DropdownMenuItem>
            </>
          );
        })}
        <DropdownMenuSeparator />
        {!addLanguages && filteredLanguages?.length ? (
          <div
            onClick={() => setAddLanguages(true)}
            className="px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100"
          >
            + Add New language
          </div>
        ) : (
          <div>
            {filteredLanguages?.map((filteredLanguage) => {
              return (
                <>
                  <DropdownMenuItem
                    key={filteredLanguage.lang}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLearningLanguage(filteredLanguage.lang);
                      addLanguageToUser(filteredLanguage.lang);
                    }}
                  >
                    <img
                      src={filteredLanguage?.flag}
                      className="w-8 h-8 rounded-full"
                    />{" "}
                    <p>{filteredLanguage?.name}</p>
                  </DropdownMenuItem>
                </>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
