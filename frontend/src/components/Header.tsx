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

const Header = () => {
  const { user } = useGetCurrentUser();
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/study-cards");

  return (
    <>
      {!hideLayout ? (
        <header className="container flex z-0 justify-between h-20 bg-[#F9F9F9] border-b border-gray-200">
          <div></div>
          {user?._id ? (
            <div className="flex gap-4">
              <ProfileDropdown user={user} />
              <LanguagesDropdown />
            </div>
          ) : (
            <div className="hidden w-full md:block">
              <Link to={"/login"}>
                <Button
                  variant="primary-outline"
                  className={"mt-4"}
                  size={"parent"}
                >
                  Login
                </Button>{" "}
              </Link>
              <Link to={"/register"}>
                <Button size={"parent"} className={"mt-4"}>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </header>
      ) : null}
    </>
  );
};

export default Header;
