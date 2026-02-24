import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SearchWorkers from './pages/SearchWorkers';
import EditProfile from './pages/worker/EditProfile';
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';
import MyPortfolio from './pages/worker/MyPortfolio';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import WorkerPublicProfile from './components/dashboard/WorkerPublicProfile';
import OrderDetail from './pages/OrderDetail';
import FloatingChatManager from './components/chat/FloatingChatManager';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/search-workers" 
              element={
                <ProtectedRoute requiredRole="CLIENT">
                  <SearchWorkers />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute requiredRole="WORKER">
                  <EditProfile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/worker/portfolio" 
              element={
                <ProtectedRoute requiredRole="WORKER">
                  <MyPortfolio />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/orders/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/worker/:id" 
              element={
                <WorkerPublicProfile />
              }
            />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          <FloatingChatManager />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
