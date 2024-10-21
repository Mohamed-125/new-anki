import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import { FaHamburger } from "react-icons/fa";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { useQueryClient } from "@tanstack/react-query";

export type LinkType = {
  name: string;
  path: string;
};

type NavbarProps = {
  links: LinkType[];
  gap?: number;
};

const Navbar = ({ links, gap = 1 }: NavbarProps) => {
  const { user, setUser } = useGetCurrentUser();
  const queryClient = useQueryClient();

  const logoutHandler = () => {
    axios.post("auth/logout").then((res) => {
      setUser(null);
      queryClient.clear(); // Completely clears the query cache
    });
  };

  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <NavbarBackdrop isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

      <nav className="bg-white relative shadow-lg z-[50] ">
        <div className="container relative flex items-center justify-between">
          <Link to={"/"}>
            <h1 className="text-2xl font-bold z-[60] ">Navbar</h1>
          </Link>
          <button className="z-50 hidden text-xl cursor-pointer md:block ">
            <FaHamburger
              onClick={() => {
                setIsNavOpen((pre) => !pre);
              }}
            />
          </button>

          <NavLinks
            gap={gap}
            user={user}
            links={links}
            setIsNavOpen={setIsNavOpen}
            isNavOpen={isNavOpen}
            logoutHandler={logoutHandler}
          />
        </div>
      </nav>
    </>
  );
};

export default Navbar;

function NavbarBackdrop({
  isNavOpen,
  setIsNavOpen,
}: {
  isNavOpen: boolean;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      onClick={() => setIsNavOpen((pre) => !pre)}
      className={`md:fixed backdrop  inset-0 z-[20]  ${
        isNavOpen ? " backdropOpen" : "backdropClosed"
      }  `}
    ></div>
  );
}
