import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChatManager from './components/chat/FloatingChatManager';
import ChatInboxLauncher from './components/chat/ChatInboxLauncher';

// Rutas con dependencias pesadas (Leaflet, recharts, mapa de portfolio) se
// cargan bajo demanda para reducir el bundle inicial.
const SearchWorkers = lazy(() => import('./pages/SearchWorkers'));
const EditProfile = lazy(() => import('./pages/worker/EditProfile'));
const MyPortfolio = lazy(() => import('./pages/worker/MyPortfolio'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const WorkerPublicProfile = lazy(() => import('./components/dashboard/WorkerPublicProfile'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-light">
    <Loader2 className="animate-spin text-primary" size={40} />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
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

            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>

          <FloatingChatManager />
          <ChatInboxLauncher />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#4A3B32',
                color: '#EFE6DD',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#556B2F', secondary: '#EFE6DD' } },
              error: { iconTheme: { primary: '#C04A3E', secondary: '#EFE6DD' } },
            }}
          />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
