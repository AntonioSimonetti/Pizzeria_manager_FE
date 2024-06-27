import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContextType'; 
import { useNavigate } from 'react-router-dom';


interface Pizza {
  id: number;
  nome: string;
  descrizione: string;
  fotoUrl: string;
  imgSrc: string;
  prezzo: number;
  categoryId: number;
}

const PizzaList: React.FC = () => {
  const { rawToken, decodedToken, updateTokens } = useAuth(); // Ottiene il token utente originale dal contesto di autenticazione
  const [pizzas, setPizzas] = useState<Pizza[]>([]); //da togliere
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPizzas, setFilteredPizzas] = useState<Pizza[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); //per fare il debouncing durante le richieste
  const navigate = useNavigate(); 

  useEffect(() => {
    ////console.log("effetto raw e decoded: ", rawToken, decodedToken);
  }, []);

  const fetchPizzas = async () => {
    
    const savedToken = localStorage.getItem('token');
    //console.log("saved token: ", savedToken);

    try {
      const response = await axios.get('https://localhost:7114/api/PizzaWebApi/GetAllPizzas', {
        headers: {
          Authorization: `Bearer ${savedToken}`, 
          'Content-Type': 'application/json'
        }
      });
      //console.log(response.data);
      //setPizzas(response.data);  //da togliere
      setFilteredPizzas(response.data);

    } catch (err) {
      setError('Error fetching pizzas');
    } finally {
      setLoading(false);
    }
    // Verifica il ruolo dell'utente
    try {
            if (!decodedToken && typeof savedToken === 'string') {
              updateTokens(savedToken) 
              //throw new Error('Decoded token not found');
            }
          
            // Verifica il ruolo dell'utente dal token decodificato
            if(decodedToken != null) {
            const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            //console.log("ruolo: ", userRole);
            if (!userRole || (userRole !== "ADMIN" && userRole !== "USER")) {
              //console.log("Unauthorized");
              throw new Error('Unauthorized');
            }
          //console.log('Decoded Token:', decodedToken);
          //console.log('Raw Token:', rawToken);

          setRole(userRole); 
          }
       } catch(err:any){
        //console.log(err.message);
        setError(err.message);
      }
};


  const searchPizzas = async (term: string) => {
    setError(null);
    const savedToken = localStorage.getItem('token');
    //console.log("saved token: ", savedToken);

    try {
      let response;
      if (/^\d+$/.test(term)) {
        // Se il termine contiene solo numeri, cerca per ID
        //console.log("cerco per id")
        response = await axios.get(`https://localhost:7114/api/PizzaWebApi/GetPizzaById?id=${term}`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Altrimenti, cerca per nome
        //console.log("cerco per nome")

        response = await axios.get(`https://localhost:7114/api/PizzaWebApi/GetPizzaByNamePartial/${term}`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      //console.log(response.data);
      setFilteredPizzas(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (err) {
      setError('Nessuna corrispondenza trovata..');
      //si potrebbe gestire meglio la view in caso di nessuna corrispondenza..
    }
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPizzas(term);
    }, 300); // Ritardo di 300ms per il debouncing
  };

  const deletePizza = async (id: number) => {
    const savedToken = localStorage.getItem('token');
    //console.log("saved token: ", savedToken);
    
    try {
      await axios.delete(`https://localhost:7114/api/PizzaWebApi/DeletePizza/${id}`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          'Content-Type': 'application/json'
        }
      });
      // Rimuovi la pizza eliminata dall'array di pizze
      setFilteredPizzas(filteredPizzas.filter(pizza => pizza.id !== id));
      setPizzas(pizzas.filter(pizza => pizza.id !== id));
    } catch (err) {
      setError('Error deleting pizza');
    }
  };

  //da togliere
  useEffect(() => {
    ////console.log(filteredPizzas)
  }, [filteredPizzas]);

  useEffect(() => {
    fetchPizzas();
  }, [rawToken, decodedToken]);

  if (loading) {
    return <div className='main-div-pizzas'>Loading...</div>;
  }

  if (error) {
    
    return <div className='main-div-pizzas'>
                   <input 
                      type="text" 
                      placeholder="Search for a pizza..." 
                      value={searchTerm} 
                      onChange={handleSearchChange}
                      className='search-input'
                    />
               <h1>{error}</h1>
               <a href='/pizzas'>Carica Tutte</a>
          </div>;
  }

  return (
    <div className='main-div-pizzas'>
      <input 
        type="text" 
        placeholder="Search for a pizza..." 
        value={searchTerm} 
        onChange={handleSearchChange} 
        className='search-input'
      />
      
      <h1>Pizza List</h1>
      <h2>Your role is: {role}</h2>
      <table className="table table-striped"> 
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Descrizione</th>
            <th>Immagine</th>
            <th>Prezzo</th>
            {role === "ADMIN" &&<th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredPizzas.map((pizza) => (
            <tr key={pizza.id}>
              <td>{pizza.id}</td>
              <td>{pizza.nome}</td>
              <td>{pizza.descrizione}</td>
              <td><img src={pizza.imgSrc || pizza.fotoUrl} alt={pizza.nome} className="img-thumbnail" style={{ width: '100px' }} /></td>
              <td>{pizza.prezzo} €</td>
              <td>
              <button className="btn btn-primary" onClick={() => navigate(`/details-pizza/${pizza.id}`)}>Details</button>
              {role === "ADMIN" &&<button className="btn btn-danger" onClick={() => deletePizza(pizza.id)}>Delete</button>}                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {role === "ADMIN" && <button className='btn btn-danger mb-3' onClick={() => navigate('/add-pizza')}>Add a Pizza</button>}
    </div>
  );
};

export default PizzaList;
