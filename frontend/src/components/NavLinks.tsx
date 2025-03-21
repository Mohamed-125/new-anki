import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { LinkType } from "./Navbar";
import useGetCurrentUser, { UserType } from "../hooks/useGetCurrentUser";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "react-use";
import { useState } from "react";

type NavLinkProps = {
  links: LinkType[];
  isNavOpen: boolean;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gap: number;
};

function NavLinks({ links, isNavOpen, setIsNavOpen, gap }: NavLinkProps) {
  const { user } = useGetCurrentUser();

  return (
    <div
      style={{ gap: `${gap}px` }}
      className={twMerge(
        `navlinks md:fixed md:top-0 md:bottom-0 md:right-0 md:text-xl flex items-center w-[70%] z-40  md:py-24 md:px-7 bg-white md:flex-col justify-end md:justify-start md:items-end text-[13.2px]`,
        isNavOpen ? "md:openNav" : "md:closeNav"
      )}
    >
      {links?.map((link) => {
        return (
          <Link
            key={Math.random()}
            className="hover:text-primary"
            to={link.path}
            onClick={() => {
              setIsNavOpen((pre) => !pre);
            }}
          >
            {link.name}
          </Link>
        );
      })}
      {user?._id ? (
        <>
          <ProfileDropdown setIsNavOpen={setIsNavOpen} user={user} />
          <LanguagesDropdown />
        </>
      ) : (
        <>
          <div style={{ gap: `${gap}px` }} className="flex md:hidden">
            <Link to={"/login"}>
              <Button variant="primary-outline">Login</Button>
            </Link>
            <Button>Sign Up</Button>
          </div>

          <div className="hidden w-full md:block">
            <Link to={"/login"} onClick={() => setIsNavOpen(false)}>
              <Button
                variant="primary-outline"
                className={"mt-4"}
                size={"parent"}
              >
                Login
              </Button>{" "}
            </Link>
            <Link to={"/register"} onClick={() => setIsNavOpen(false)}>
              <Button size={"parent"} className={"mt-4"}>
                Sign Up
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const ProfileDropdown = ({
  user,
  setIsNavOpen,
}: {
  user: UserType | null;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutHandler = () => {
    axios.post("auth/logout").then(() => {
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
      navigate("/login");
    });
    setIsNavOpen(false);
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
  const languageOptions = [
    {
      value: "de",
      label: "German",
      flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg",
    },
    {
      value: "en",
      label: "English",
      flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    },
    {
      value: "es",
      label: "Spanish",
      flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg",
    },
    {
      value: "fr",
      label: "French",
      flag: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg",
    },
  ];

  const { user } = useGetCurrentUser();

  const [addLanguages, setAddLanguages] = useState(false);

  const filteredLanguages = languageOptions.filter(
    (option) => !user?.languages.includes(option.value)
  );

  const { selectedLearningLanguage, setSelectedLearningLanguage } =
    useGetCurrentUser();

  const queryClient = useQueryClient();

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

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={() => {
        setAddLanguages(false);
      }}
    >
      <DropdownMenuTrigger className="ml-1 text-2xl">
        <img
          src={
            languageOptions.find(
              (language) => language.value === selectedLearningLanguage
            )?.flag
          }
          className="object-fill w-11 h-11 rounded-full"
        />{" "}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-4 w-[200px] py-5 mt-2 bg-popover">
        {user?.languages.map((userLanguage) => {
          const language = languageOptions.find(
            (option) => option.value === userLanguage
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
                <p>{language?.label}</p>
              </DropdownMenuItem>
            </>
          );
        })}
        <DropdownMenuSeparator />
        {!addLanguages && filteredLanguages.length ? (
          <div
            onClick={() => setAddLanguages(true)}
            className="px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100"
          >
            + Add New language
          </div>
        ) : (
          <div>
            {filteredLanguages.map((filteredLanguage) => {
              return (
                <>
                  <DropdownMenuItem
                    key={filteredLanguage.value}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLearningLanguage(filteredLanguage.value);
                      addLanguageToUser(filteredLanguage.value);
                    }}
                  >
                    <img
                      src={filteredLanguage?.flag}
                      className="w-8 h-8 rounded-full"
                    />{" "}
                    <p>{filteredLanguage?.label}</p>
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

export default NavLinks;
