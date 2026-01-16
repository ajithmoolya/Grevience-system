import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Placeholder components for now
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Staff from './pages/Staff';
import Categories from './pages/Categories';
import Grievances from './pages/Grievances';
import Logs from './pages/Logs';
import Users from './pages/Users';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admins" element={<Admins />} />
          <Route path="staff" element={<Staff />} />
          <Route path="categories" element={<Categories />} />
          <Route path="Users" element={<Users />} /> {/* ⬅️ NEW ROUTE */}
          <Route path="grievances" element={<Grievances />} />
          <Route path="logs" element={<Logs />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
