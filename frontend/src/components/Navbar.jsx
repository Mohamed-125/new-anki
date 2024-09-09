import React, { useContext } from "react";
import Button from "./Button";
import axios from "axios";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";
import { FaHamburger } from "react-icons/fa";

const Navbar = ({ user, isNavOpen, setIsNavOpen, links, gap = 1 }) => {
  const logoutHandler = () => {};

  return (
    <>
      <NavbarBackdrop isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

      <nav className="bg-white relative shadow-lg z-[50] ">
        <div className="container relative flex items-center justify-between">
          <h1 className="text-2xl font-bold z-[60] ">Navbar</h1>
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
            user={user}
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

function NavbarBackdrop({ isNavOpen, setIsNavOpen }) {
  return (
    <div
      onClick={() => setIsNavOpen((pre) => !pre)}
      className={`md:fixed backdrop  inset-0 z-[20]  ${
        isNavOpen ? " backdropOpen" : "backdropClosed"
      }  `}
    ></div>
  );
}
