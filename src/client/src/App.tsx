import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/Login/WelcomePage';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/Login/SignUpPage';
import HomePage from './pages/HomePage';
import FriendListPage from './pages/Friend/FriendListPage';
import AccountingPage from './pages/Accounting/AccountingPage';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/friendlist" element={<FriendListPage />} />
        <Route path="/accounting" element={<AccountingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;