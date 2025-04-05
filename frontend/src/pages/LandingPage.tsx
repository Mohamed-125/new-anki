import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="py-4 text-white bg-blue-600">
        <div className="container flex justify-between items-center mx-auto">
          <h1 className="text-3xl font-bold">Collingo</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/learn" className="hover:underline">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:underline">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container py-8 mx-auto">
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Welcome to Collingo</h2>
          <p className="text-lg">
            Your journey to mastering new languages starts here.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-2 text-2xl font-bold">Learn with Cards</h3>
            <p className="text-gray-700">
              Interactive flashcards to enhance your vocabulary.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-2 text-2xl font-bold">Explore Courses</h3>
            <p className="text-gray-700">
              Structured courses for comprehensive learning.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-2 text-2xl font-bold">Watch Videos</h3>
            <p className="text-gray-700">
              Engaging video content to improve your skills.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-4 text-white bg-gray-800">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Collingo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
