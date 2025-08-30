import "./App.scss";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/SelectedLearningLanguageContext.tsx";
import Sidebar from "./components/Sidebar";
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
import Profile from "./pages/Profile.tsx";
import AddNewNote from "./pages/AddNewNote.tsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.tsx";
import { ReactNode, useEffect, useState } from "react";
import Admin from "./pages/Admin/Admin.tsx";
import AiChat from "./components/AiChat";
import AdminCourses from "./pages/Admin/AdminCourses.tsx";
import AdminCourse from "./pages/Admin/AdminCourse.tsx";
import AdminUsers from "./pages/Admin/Users/AdminUsers.tsx";
import AdminLesson from "./pages/Admin/AdminLesson.tsx";
import AdminCourseLevel from "./pages/Admin/AdminCourseLevel.tsx";
import LearnPage from "./pages/LearnPage";
import LessonPage from "./pages/LessonPage";
import GetTranscript from "./pages/GetTranscript";
import AdminTopic from "./pages/Admin/AdminTopic.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import AdminChannel from "./pages/AdminChannel.tsx";
import Channel from "./pages/Channel.tsx";
import AdminList from "./pages/AdminList.tsx";
import ListPage from "./pages/ListPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header.tsx";

function App() {
  const { user, selectedLearningLanguage } = useGetCurrentUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
    { name: "Collections", path: "/collections" },
    { name: "videos", path: "/videos" },
    { name: "playlists", path: "/playlists" },
    { name: "Notes", path: "/notes" },
    { name: "word article", path: "/article" },
    { name: "My Texts", path: "/texts" },
    { name: "Library", path: "/library" },
  ];

  return (
    <>
      <Router>
        <LanguageProvider user={user}>
          <div className="flex min-h-screen">
            <Sidebar
              links={links}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
            />

            <div className="overflow-y-auto flex-1 bg-white">
              <Header links={links} setIsMobileOpen={setIsMobileOpen} />
              <Routes>
                <Route
                  path={`/`}
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                ></Route>

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
                  path="/library/:channelId"
                  element={
                    <ProtectedRoute>
                      <Channel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lists/:listId"
                  element={
                    <ProtectedRoute>
                      <ListPage />
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
                  path="/transcript"
                  element={
                    <ProtectedRoute>
                      <GetTranscript />
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
                  path="/article"
                  element={
                    <ProtectedRoute>
                      <WordArticle />
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

                <Route
                  path="/learn"
                  element={
                    <ProtectedRoute>
                      <LearnPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/learn/:lessonId"
                  element={
                    <ProtectedRoute>
                      <LessonPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/learn/:courseLevelId/:lessonId"
                  element={
                    <ProtectedRoute>
                      <LessonPage />
                    </ProtectedRoute>
                  }
                />
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

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="courses/:courseId" element={<AdminCourse />} />
                  <Route
                    path="courses/:courseId/:courseLevelId"
                    element={<AdminCourseLevel />}
                  />
                  <Route
                    path="courses/:courseId/:courseLevelId/:lessonId"
                    element={<AdminLesson />}
                  />

                  <Route path="topics/:topicId" element={<AdminTopic />} />

                  <Route
                    path="topics/:topicId/:channelId"
                    element={<AdminChannel />}
                  />

                  <Route
                    path="topics/:topicId/lists/:listId"
                    element={<AdminList />}
                  />
                </Route>

                <Route path="/landing" element={<LandingPage />} />
                <Route
                  path="*"
                  element={selectedLearningLanguage ? <PageNotFound /> : ""}
                />

                <Route
                  path="/study-cards/:collectionId?"
                  element={
                    <ProtectedRoute>
                      <StudyCards />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <ChatComponent />
            </div>
          </div>
        </LanguageProvider>
      </Router>
      <AiChat />
    </>
  );
}

export default App;

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user?.isAdmin) {
        console.log("admin route worked");
        navigate("/");
      }
    }
  }, [user, isLoading]);

  return <>{user && children}</>;
};
