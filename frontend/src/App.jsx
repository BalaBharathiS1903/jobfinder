import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Resumes from "./pages/Resumes";
import Search from "./pages/Search";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import ManualProfile from "./pages/ManualProfile";
import ProfileView from "./pages/ProfileView";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeBuilder from "./pages/ResumeBuilder";
import PrepHub from "./pages/PrepHub";
import IQGame from "./pages/IQGame";
import MockInterview from "./pages/MockInterview";
import TestPage from "./pages/TestPage";
import LearningPath from "./pages/LearningPath";
import Certificate from "./pages/Certificate";
import AllCourses from "./pages/AllCourses";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminUserDetail from "./pages/AdminUserDetail";
import UserActivity from "./pages/UserActivity";
import PrepRoute from "./components/PrepRoute";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_superuser) return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
        <Route path="/resumes/:id/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
        <Route path="/my-activity" element={<ProtectedRoute><UserActivity /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><ManualProfile /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/prep" element={<ProtectedRoute><PrepRoute><PrepHub /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/courses" element={<ProtectedRoute><PrepRoute><AllCourses /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/iq" element={<ProtectedRoute><PrepRoute><IQGame /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/interview" element={<ProtectedRoute><PrepRoute><MockInterview /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/test" element={<ProtectedRoute><PrepRoute><TestPage /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/course/:courseId" element={<ProtectedRoute><PrepRoute><LearningPath /></PrepRoute></ProtectedRoute>} />
        <Route path="/prep/certificate/:courseId" element={<ProtectedRoute><PrepRoute><Certificate /></PrepRoute></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
        <Route path="/admin-dashboard/user/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}
