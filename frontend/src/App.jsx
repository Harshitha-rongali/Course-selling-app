import { Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import RequireRole from './components/auth/RequireRole.jsx';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetails from './pages/CourseDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.shell}>
      <a className="skipLink" href="#main-content">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/login" element={<Login role="user" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login role="admin" />} />
          <Route
            path="/dashboard"
            element={
              <RequireRole role="user">
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
