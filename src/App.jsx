import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Features from "./components/Features/Features";
import JoinUs from "./components/JoinUs/JoinUs";
import Footer from "./components/Footer/Footer";
import Dashboard from "./components/DashboardMain/DashboardMain";
import DashboardPractice from "./components/DashboardPractice/DashboardPractice";
import DashboardSettings from "./components/DashboardSettings/DashboardSettings";
import FirstGrade from "./components/FirstGrade/FirstGrade";
import SecondGrade from "./components/SecondGrade/SecondGrade";
import ThirdGrade from "./components/ThirdGrade/ThirdGrade";
import FourthGrade from "./components/FourthGrade/FourthGrade";
import FifthGrade from "./components/FifthGrade/FifthGrade";
import SixthGrade from "./components/SixthGrade/SixthGrade";
import SeventhGrade from "./components/SeventhGrade/SeventhGrade";
import EighthGrade from "./components/EighthGrade/EighthGrade";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Betöltés...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <HelmetProvider>
      <Router>
        <Helmet>
          <title>MathHero</title>
        </Helmet>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <DashboardPractice username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Első évfolyam"
            element={
              <ProtectedRoute>
                <FirstGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Második évfolyam"
            element={
              <ProtectedRoute>
                <SecondGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Harmadik évfolyam"
            element={
              <ProtectedRoute>
                <ThirdGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Negyedik évfolyam"
            element={
              <ProtectedRoute>
                <FourthGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Ötödik évfolyam"
            element={
              <ProtectedRoute>
                <FifthGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Hatodik évfolyam"
            element={
              <ProtectedRoute>
                <SixthGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Hetedik évfolyam"
            element={
              <ProtectedRoute>
                <SeventhGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/Nyolcadik évfolyam"
            element={
              <ProtectedRoute>
                <EighthGrade username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardSettings username={user?.displayName} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <>
                <Header />
                <Hero />
                <Features />
                <JoinUs />
                <Footer />
              </>
            }
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;