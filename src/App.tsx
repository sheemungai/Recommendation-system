import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import Profile         from './pages/Profile';
import Grades          from './pages/Grades';
import Assessment      from './pages/Assessment';
import ClusterCalculator from './pages/ClusterCalculator';
import Careers         from './pages/Careers';
import Courses         from './pages/Courses';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/grades"    element={<ProtectedRoute><Grades /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><ClusterCalculator /></ProtectedRoute>} />
          <Route path="/careers"   element={<ProtectedRoute><Careers /></ProtectedRoute>} />
          <Route path="/courses"   element={<ProtectedRoute><Courses /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
