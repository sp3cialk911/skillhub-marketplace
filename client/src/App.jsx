import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductMarketplace from './pages/ProductMarketplace';
import CoursesPage from './pages/CoursesPage';
import SkillsMarketplace from './pages/SkillsMarketplace';

import './index.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<ProductMarketplace />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/skills" element={<SkillsMarketplace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
