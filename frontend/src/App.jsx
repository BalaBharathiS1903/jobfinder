import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PrepRoute from "./components/PrepRoute";
import { useAuth } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Resumes = lazy(() => import("./pages/Resumes"));
const Search = lazy(() => import("./pages/Search"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const Profile = lazy(() => import("./pages/Profile"));
const ManualProfile = lazy(() => import("./pages/ManualProfile"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const ResumeAnalyzer = lazy(() => import("./pages/ResumeAnalyzer"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const PrepHub = lazy(() => import("./pages/PrepHub"));
const IQGame = lazy(() => import("./pages/IQGame"));
const MockInterview = lazy(() => import("./pages/MockInterview"));
const TestPage = lazy(() => import("./pages/TestPage"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const Certificate = lazy(() => import("./pages/Certificate"));
const AllCourses = lazy(() => import("./pages/AllCourses"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const AdminUserDetail = lazy(() => import("./pages/AdminUserDetail"));
const UserActivity = lazy(() => import("./pages/UserActivity"));

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_superuser) return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/home" replace />;
}

function RouteLoader() {
  return <div className="loading">Loading...</div>;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<RouteLoader />}>
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
      </Suspense>
    </>
  );
}
