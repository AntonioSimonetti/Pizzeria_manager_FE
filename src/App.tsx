import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContextType';
import Login from './components/Login';
import PizzaList from './components/PizzaList';
import Navbar from './components/Navbar';
import PizzaForm from './components/AddPizza';
import DetailsPizza from './components/DetailsPizza';
import "./App.css";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('token') !== null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(token !== null);

    console.log('Token:', token);
  },[]);



  return (
    <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/pizzas" element={isLoggedIn ? <><Navbar setIsLoggedIn={setIsLoggedIn}/><PizzaList /></> : <Navigate to="/login" />} />
            <Route path="/add-pizza" element={isLoggedIn ? <><Navbar setIsLoggedIn={setIsLoggedIn}/><PizzaForm /></> : <Navigate to="/login" />} />
            <Route path="/details-pizza/:id" element={isLoggedIn ? <><Navbar setIsLoggedIn={setIsLoggedIn}/><DetailsPizza /></> : <Navigate to="/login" />} /> {/* Aggiungi la rotta per DetailsPizza */}
          </Routes>
        </Router>
    </AuthProvider>
  );
};

export default App;
