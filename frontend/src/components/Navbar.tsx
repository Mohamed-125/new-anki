import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import { FaHamburger } from "react-icons/fa";

export type LinkType = {
  name: string;
  path: string;
};

type NavbarProps = {
  links: LinkType[];
  gap?: number;
};

const Navbar = ({ links, gap = 1 }: NavbarProps) => {
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
            links={links}
            setIsNavOpen={setIsNavOpen}
            isNavOpen={isNavOpen}
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
