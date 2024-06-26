
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DecodedToken } from '../AuthContextType'; // Importa useAuth e DecodedToken dal contesto
import { jwtDecode } from 'jwt-decode';



interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRawToken, setDecodedToken } = useAuth();



  const handleLogin = async () => {
    try {
      const response = await fetch('https://localhost:7114/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: email, Password: password })
      });

      console.log(response);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Data:', data);

      const token = data.token;
      console.log('Login successful. Token:', token);

      // Salva il token nel local storage
      localStorage.setItem('token', token);

      // Verifica che il token sia stato salvato
      const savedToken = localStorage.getItem('token');
      console.log('Saved token:', savedToken);

      setRawToken(token);
      const decodedToken: DecodedToken = jwtDecode(token);

      setDecodedToken(decodedToken);

      setIsLoggedIn(true);


      // Naviga verso la pagina delle pizze dopo il login
      navigate('/pizzas');
      console.log('Navigating to /pizzas');
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Errore durante il login: ' + error.message);
    }
  };

  return (
  
   <div className='d-flex flex-column justify-content-center align-items-center vw-100'>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <div>
        <label>Email:</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleLogin}>Login</button>
   </div>
       
     
  
  );
};

export default Login;