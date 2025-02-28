import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { LinkType } from "./Navbar";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            key={link.name}
            className="hover:text-blue-500"
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
        <ProfileDropdown setIsNavOpen={setIsNavOpen} user={user} />
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
      queryClient.clear();
      navigate("/login");
    });
    setIsNavOpen(false);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="ml-1 text-2xl">
        <div className="flex items-center justify-center font-bold text-white rounded-full w-11 h-11 bg-sky-900">
          {user?.email?.[0]}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-4 py-5 mt-6 font-semibold bg-popover">
        <strong>{user?.email}</strong>
        <DropdownMenuSeparator className="my-3 h-[2px]" />
        <Button onClick={logoutHandler} variant="danger">
          Logout
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavLinks;
