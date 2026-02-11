
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import Reports from './components/Reports';
import Documentation from './components/Documentation';
import UserManagement from './components/UserManagement';
import SalesOrders from './components/SalesOrders';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexgen_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('nexgen_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexgen_user');
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<InventoryTable role={user?.role || UserRole.USER} />} />
          <Route path="sales" element={user ? <SalesOrders user={user} /> : <Navigate to="/login" />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={user?.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="docs" element={user?.role === UserRole.ADMIN ? <Documentation /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
