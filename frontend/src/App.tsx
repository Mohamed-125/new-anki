import { useContext, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Collections from "./pages/Collections";
import CollectionPage from "./pages/CollectionPage";
import Video from "./pages/video/Video";
import Videos from "./pages/Videos";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import ChatComponent from "./components/ChatComponent";
import ImportantChannelsAndVideos from "./pages/ImportantChannelsAndVideos";
import Notes from "./pages/Notes";
import Note from "./pages/Note";
import TextPage from "./pages/TextPage";
import MyTexts from "./pages/MyTexts";
import AddNewText from "./pages/AddNewText";
import WordArticle from "./pages/WordArticle.tsx";
import axios from "axios";
import useToasts from "./hooks/useToasts";
import Library from "./pages/Library.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import useGetCurrentUser from "./hooks/useGetCurrentUser.tsx";

function App() {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:5000/api/v1/";

  const links = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "videos", path: "/videos" },
    { name: "playlists", path: "/playlists" },
    { name: "Notes", path: "/notes" },
    { name: "word article", path: "/article" },
    { name: "My Texts", path: "/myTexts" },
    { name: "Library", path: "/library" },
    { name: "channels", path: "/channels" },
  ];

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar links={links} gap={7} />

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
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
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

          <Route
            path="/playlist/:id"
            element={
              <ProtectedRoute>
                <Playlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <Playlists />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <Note />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myTexts"
            element={
              <ProtectedRoute>
                <MyTexts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/myTexts/:id"
            element={
              <ProtectedRoute>
                <TextPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-text/"
            element={
              <ProtectedRoute>
                <AddNewText />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-text/:id"
            element={
              <ProtectedRoute>
                <AddNewText />
              </ProtectedRoute>
            }
          />

          <Route
            path="/channels"
            element={
              <ProtectedRoute>
                <ImportantChannelsAndVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/article"
            element={
              <ProtectedRoute>
                <WordArticle />
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
