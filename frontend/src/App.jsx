import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
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
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeBuilder from "./pages/ResumeBuilder";
import PrepHub from "./pages/PrepHub";
import IQGame from "./pages/IQGame";
import MockInterview from "./pages/MockInterview";
import TestPage from "./pages/TestPage";
import LearningPath from "./pages/LearningPath";
import Certificate from "./pages/Certificate";
import AllCourses from "./pages/AllCourses";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
        <Route path="/resumes/:id/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><ManualProfile /></ProtectedRoute>} />
        <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/prep" element={<ProtectedRoute><PrepHub /></ProtectedRoute>} />
        <Route path="/prep/courses" element={<ProtectedRoute><AllCourses /></ProtectedRoute>} />
        <Route path="/prep/iq" element={<ProtectedRoute><IQGame /></ProtectedRoute>} />
        <Route path="/prep/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/prep/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
        <Route path="/prep/course/:courseId" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
        <Route path="/prep/certificate/:courseId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
