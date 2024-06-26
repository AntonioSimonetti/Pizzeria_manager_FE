import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Definizione dell'interfaccia per il contesto di autenticazione
interface AuthContextType {
  decodedToken: DecodedToken | null; // Token utente decodificato o null se non disponibile
  rawToken: string | null; // Token utente originale
  setRawToken: React.Dispatch<React.SetStateAction<string | null>>; // Funzione per impostare il token utente
  setDecodedToken: React.Dispatch<React.SetStateAction<DecodedToken | null>>; // Funzione per impostare il token utente
  logout: () => void; // Funzione di logout
  updateTokens: (rawToken:string) => void; // Aggiorna i token nel contesto
  decodeFunction: () => void;

}

// Interfaccia per il token decodificato
export interface DecodedToken {
  aud: string;
  exp: number;
  iss: string;
  jti: string;
  sub: string;
  roles: string; 
  [key: string]: any; // Per altre proprietà non specificate
}

// Creazione del contesto di autenticazione
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizzato per utilizzare il contesto di autenticazione
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); // Assicura che useAuth venga utilizzato all'interno di AuthProvider
  }
  return context;
};

// Props per il provider di autenticazione
interface AuthProviderProps {
  children: ReactNode; // Contenuto figlio passato al provider
}

// Provider di autenticazione che gestisce il token utente
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null); // Stato locale per il token utente decodificato
  const [rawToken, setRawToken] = useState<string | null>(localStorage.getItem('token')); // Stato locale per il token utente originale

  useEffect(() => {
    const token = localStorage.getItem('token'); // Ottiene il token dal localStorage

    if (token !== rawToken) {
      // Il token è cambiato nel localStorage
      console.log("il token è cambiato");
      if (token) {
        console.log("lo decodifico");
        const decodedToken: DecodedToken = jwtDecode(token);
        setDecodedToken(decodedToken); // Imposta il token utente decodificato nello stato locale
        setRawToken(token); // Imposta il token utente originale nello stato locale
      } else {
        console.log("il token non c'è rimuovo tutto");
        setDecodedToken(null); // Nessun token disponibile nel localStorage
        setRawToken(null); // Nessun token disponibile nel localStorage
      }
    }
  }, [rawToken]); // Rileva cambiamenti solo in rawToken


  const decodeFunction = () => {
    const token = localStorage.getItem('token');
    if (token !== null) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setDecodedToken(decodedToken);
      setRawToken(token);
    } else {
      throw new Error("No raw token found.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setDecodedToken(null);
    setRawToken(null);
  };

  const updateTokens = (rawToken:string) => {

    if (rawToken !== null) {
    const decodedToken: DecodedToken = jwtDecode(rawToken);
    setRawToken(rawToken);
    setDecodedToken(decodedToken);
    }

  };

  return (
    <AuthContext.Provider value={{ decodedToken, rawToken, setRawToken, setDecodedToken, logout, updateTokens, decodeFunction }}> 
      {children} 
    </AuthContext.Provider>
  );
};
