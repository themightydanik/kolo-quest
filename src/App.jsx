import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { LangProvider as LanguageProvider } from './i18n/index'
import LoginPage from './pages/LoginPage'
import ChildDashboard from './pages/ChildDashboard'
import ParentDashboard from './pages/ParentDashboard'

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100"><div className="text-5xl animate-bounce">⭐</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'parent' ? '/parent' : '/child'} replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100"><div className="text-5xl animate-bounce">⭐</div></div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'parent' ? '/parent' : '/child'} replace /> : <LoginPage />} />
      <Route path="/child/*" element={<RequireAuth role="child"><ChildDashboard /></RequireAuth>} />
      <Route path="/parent/*" element={<RequireAuth role="parent"><ParentDashboard /></RequireAuth>} />
      <Route path="*" element={<Navigate to={user ? (user.role === 'parent' ? '/parent' : '/child') : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
