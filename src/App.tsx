import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ReportsPage } from './pages/ReportsPage';
import { MyContentPage } from './pages/MyContentPage';
import { AddComponentPage } from './pages/AddComponentPage';
import { Navigation } from './components/Navigation';
import { ViewComponentPage } from './pages/ViewComponentPage';
import { EditComponentPage } from './pages/EditComponentPage';
import { UserProfilePage } from './pages/UserProfilePage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Initialize from localStorage
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // persist login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // clear persistence
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-content" element={<MyContentPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/add-component" element={<AddComponentPage />} />
          <Route path="/view-component" element={<ViewComponentPage />} />
          <Route path="/edit-component" element={<EditComponentPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
