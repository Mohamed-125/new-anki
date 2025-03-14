import "./App.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
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
import Library from "./pages/Library.tsx";
import PageNotFound from "./pages/PageNotFound.tsx";
import StudyCards from "./pages/StudyCards.tsx";
import Congrats from "./pages/Congrats.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import BreadCramps from "./components/BreadCramps.tsx";
import Profile from "./pages/Profile.tsx";
import AddNewNote from "./pages/AddNewNote.tsx";

function App() {
  const links = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: "videos", path: "/videos" },
    { name: "playlists", path: "/playlists" },
    { name: "Notes", path: "/notes" },
    { name: "word article", path: "/article" },
    { name: "My Texts", path: "/texts" },
    { name: "Library", path: "/library" },
    { name: "channels", path: "/channels" },
  ];

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar links={links} gap={7} />
        {/* <div className="container mt-4">
          {" "}
          <BreadCramps />
        </div> */}
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
            path={`/collections/*`}
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
            path="/videos/:id"
            element={
              <ProtectedRoute>
                <Video />
              </ProtectedRoute>
            }
          />

          <Route
            path="/playlists/:id"
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
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <Note />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes/new"
            element={
              <ProtectedRoute>
                <AddNewNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/edit/:id"
            element={
              <ProtectedRoute>
                <AddNewNote />
              </ProtectedRoute>
            }
          />

          <Route
            path="/texts"
            element={
              <ProtectedRoute>
                <MyTexts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/texts/:id"
            element={
              <ProtectedRoute>
                <TextPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/texts/new"
            element={
              <ProtectedRoute>
                <AddNewText />
              </ProtectedRoute>
            }
          />
          <Route
            path="/texts/edit/:id"
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

          <Route
            path="/study-cards/:collectionId?"
            element={
              <ProtectedRoute>
                <StudyCards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/congrats"
            element={
              <ProtectedRoute>
                <Congrats />
              </ProtectedRoute>
            }
          />

          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ChatComponent />
      </div>
    </Router>
  );
}

export default App;
