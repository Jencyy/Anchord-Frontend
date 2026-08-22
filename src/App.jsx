/**
 * Main Application Component
 * -----------------------------------------------------------
 * Sets up the React Router for navigation and wraps the app with
 * the AuthProvider to give all routes access to authentication context.
 * -----------------------------------------------------------
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import AddHabit from './pages/AddHabit';
import HabitsLayout from './pages/HabitsLayout';
import HabitsView from './pages/HabitsView';
import ScheduleView from './pages/ScheduleView';
import SettingsView from './components/SettingsView';
import AnalyticsView from './pages/AnalyticsView';

/**
 * App Component
 * Defines the public and protected routes for the application.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route element={<HabitsLayout />}>
              <Route index element={<HabitsView />} />
            </Route>
            <Route path="add-habit" element={<AddHabit />} />
            <Route path="schedule" element={<ScheduleView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="analytics" element={<AnalyticsView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
