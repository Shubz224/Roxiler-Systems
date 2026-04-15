import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ChangePassword from './pages/shared/ChangePassword';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';

import StoreList from './pages/user/StoreList';
import StoreDetail from './pages/user/StoreDetail';

import OwnerDashboard from './pages/owner/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Navigate to="/stores" replace />} />

                {/* All authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/change-password" element={<ChangePassword />} />
                </Route>

                {/* Normal USER routes */}
                <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                  <Route path="/stores" element={<StoreList />} />
                  <Route path="/stores/:id" element={<StoreDetail />} />
                </Route>

                {/* ADMIN routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/stores" element={<AdminStores />} />
                </Route>

                {/* STORE_OWNER routes */}
                <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
                  <Route path="/owner" element={<OwnerDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
