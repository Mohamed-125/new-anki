import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Collections from "./pages/Collections";
import CollectionPage from "./pages/CollectionPage";
import Video from "./pages/video/Video";
import Videos from "./pages/Videos";
import ChatComponent from "./components/ChatComponent";

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "videos", path: "/videos" },
    { name: "Your playlists", path: "/playlists" },
  ];

  const text = async () => {
    // const prompt = "Write a story about a magic backpack.";
    // const result = await model.generateContent(prompt);
    // console.log(result.response.text());
  };

  text();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar
          links={links}
          setIsNavOpen={setIsNavOpen}
          isNavOpen={isNavOpen}
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />

          <Route
            path={`/collections/:id`}
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <Video />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <ChatComponent />
      </div>
    </Router>
  );
}

export default App;
