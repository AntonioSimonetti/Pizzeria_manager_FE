// Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContextType';

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Navbar: React.FC<LoginProps> = ({ setIsLoggedIn }) => {

    const { decodedToken, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      setIsLoggedIn(false);
      navigate('/login'); // Reindirizza alla pagina di login
    };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
      <button className="navbar-brand btn btn-link" onClick={handleLogout}>Logout</button>
      <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/pizzas">Pizzas</Link>
            </li>
            <li className="nav-item">
              <span className="nav-link disabled">Welcome, {decodedToken?.sub}</span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
