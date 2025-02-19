import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../context/UserContext";
import { LinkType } from "./Navbar";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

type NavLinkProps = {
  links: LinkType[];
  isNavOpen: boolean;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gap: number;
};

function NavLinks({ links, isNavOpen, setIsNavOpen, gap }: NavLinkProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { user, setUser } = useGetCurrentUser();
  const logoutHandler = () => {
    axios.post("auth/logout").then(() => {
      setUser(null);
      queryClient.clear(); // Completely clears the query cache
      navigate("/login");
    });
  };

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
      {user ? (
        <>
          <Button onClick={logoutHandler} variant="danger">
            Logout
          </Button>
          {/* <p>{user.email}</p>
          <p>{user._id}</p> */}
        </>
      ) : (
        <>
          <div style={{ gap: `${gap}px` }} className="flex md:hidden">
            <Button variant="primary-outline">Login</Button>
            <Button>Sign Up</Button>
          </div>

          <div className="hidden w-full md:block">
            <Button
              variant="primary-outline"
              className={"mt-4"}
              size={"parent"}
            >
              Login
            </Button>
            <Button size={"parent"} className={"mt-4"}>
              Sign Up
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default NavLinks;
