import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContextType';

interface Category {
  id: number;
  title: string;
}

interface Ingredient {
  id: number;
  name: string;
  Pizze: any[];
}

interface Pizza {
  id: number;
  nome: string;
  descrizione: string;
  fotoUrl?: string;
  imgSrc?: string;
  prezzo: number;
  categoryId?: number;
  ingredienti: { id: number, Name: string, Pizze: any[] }[];
}

const DetailsPizza: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Pizza>>({ });
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { rawToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPizzaById = async () => {
      const savedToken = localStorage.getItem('token');
      try {
        const response = await axios.get(`https://localhost:7114/api/PizzaWebApi/GetPizzaById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });
        setPizza(response.data);
        setFormData(response.data);
        setSelectedIngredients(response.data.ingredienti);
        console.log("pizz", pizza);
        console.log("formdata", formData);
        console.log("selectedIng", selectedIngredients);

      } catch (error) {
        console.error('Error fetching pizza by ID:', error);
      }
    };
    
    
    const fetchData = async () => {
      try {
        const [categoriesResponse, ingredientsResponse] = await Promise.all([
          axios.get('https://localhost:7114/api/PizzaWebApi/GetAllCategories', {
            headers: {
              Authorization: `Bearer ${rawToken}`,
              'Content-Type': 'application/json'
            }
          }),
          axios.get('https://localhost:7114/api/PizzaWebApi/GetAllIngredienti', {
            headers: {
              Authorization: `Bearer ${rawToken}`,
              'Content-Type': 'application/json'
            }
          })
        ]);
        setCategories(categoriesResponse.data);
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error('Error fetching categories or ingredients', error);
      }
    }; 

    fetchPizzaById();
    fetchData();
  }, [id, rawToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedToken = localStorage.getItem('token');

    const createPizzaPayload = (fotoUrl: string = formData.fotoUrl || ''): Pizza => ({
      id: pizza!.id,
      nome: formData.nome!,
      descrizione: formData.descrizione!,
      fotoUrl,
      prezzo: parseFloat(String(formData.prezzo)),
      categoryId: formData.categoryId ? parseInt(String(formData.categoryId)) : undefined,
      ingredienti: formData.ingredienti!.map(ingredient => ({
        id: ingredient.id,
        Name: ingredient.Name,
        Pizze: []  //sempre vuoto perchè sul BE questo parametro non viene veramente usato 
      }))
    });

    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const fotoUrl = reader.result as string;
        const updatedPizza = createPizzaPayload(fotoUrl);

        try {
          console.log('Payload inviato al backend:', updatedPizza); // Log del payload

          const response = await axios.put(`https://localhost:7114/api/PizzaWebApi/UpdatePizza/${id}`, updatedPizza, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });
          setPizza(response.data);
          setIsEditing(false);
          navigate('/pizzas');
        } catch (error) {
          console.error('Error updating pizza:', error);
        }
      };
    } else {
      const updatedPizza = createPizzaPayload();

      try {
        console.log('Payload inviato al backend:', updatedPizza); // Log del payload

        const response = await axios.put(`https://localhost:7114/api/PizzaWebApi/UpdatePizza/${id}`, updatedPizza, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });
        setPizza(response.data);
        setIsEditing(false);
        navigate('/pizzas');
      } catch (error) {
        console.error('Error updating pizza:', error);
      }
    }
  };

  useEffect(() =>{
    console.log("formdata", formData);
  },[formData])

  return (
    <div>
      {pizza ? (
        <div className='details-div'>
          <h1>Pizza Details</h1>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <strong>Nome:</strong>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Descrizione:</strong>
                <textarea
                  name="descrizione"
                  value={formData.descrizione || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Prezzo:</strong>
                <input
                  type="number"
                  name="prezzo"
                  value={formData.prezzo || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Categoria:</strong>
                <select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                >
                  <option value=''>Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>
              <div className='form-field'>
                <label>Image</label>
                <input type='file' onChange={handleFileChange} className='d-block w-100' />
              </div>
              <div>
                 <img src={formData.fotoUrl}></img>
              </div>
              <div className='mb-3'>
                <strong>Ingredienti:</strong>
                <select
                  multiple={true}
                  value={selectedIngredients.map(ingredient => ingredient.id.toString())}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                    const selectedIngredientObjects = selectedIds.map(id => ingredients.find(ingredient => ingredient.id.toString() === id)!);
                    setSelectedIngredients(selectedIngredientObjects);
                    setFormData({
                      ...formData,
                      ingredienti: selectedIngredientObjects.map(ingredient => ({
                        id: ingredient.id,
                        Name: ingredient.name,
                        Pizze: [] //sempre vuoto perché sul BE questo parametro non viene veramente usato
                      }))
                    });
                  }}
                  className='form-control mb-2 mr-sm-2 ml-sm-3 leftList'
                >
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id.toString()}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>

              </div>
              <div className='text-end'>
                <button type="submit" className='btn btn-success mt-3'>Submit</button>
                <button type="button" onClick={() => setIsEditing(false)} className='btn btn-secondary mt-3'>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p>ID: {pizza.id}</p>
              <p>Nome: {pizza.nome}</p>
              <p>Descrizione: {pizza.descrizione}</p>
              <p>Prezzo: {pizza.prezzo} €</p>
              <img src={pizza.imgSrc || pizza.fotoUrl} alt={pizza.nome} />
              <button onClick={() => setIsEditing(true)} className='btn btn-danger mt-3'>Modify</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DetailsPizza;




/*

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContextType';

// Definizione delle interfacce per i tipi di dati utilizzati nel componente
interface Category {
  id: number;
  title: string;
}

interface Ingredient {
  id: number;
  name: string;
  Pizze: any[]; // Assumendo che 'Pizze' sia un array di tipo non specificato
}

interface Pizza {
  id: number;
  nome: string;
  descrizione: string;
  fotoUrl?: string;
  imgSrc?: string;
  prezzo: number;
  categoryId?: number;
  ingredienti: { id: number, Name: string, Pizze: any[] }[]; // Array di oggetti con campi specificati
}

const DetailsPizza: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Ottiene l'id dalla URL
  const [pizza, setPizza] = useState<Pizza | null>(null); // Stato per la pizza recuperata
  const [isEditing, setIsEditing] = useState<boolean>(false); // Stato per gestire la modalità di modifica
  const [formData, setFormData] = useState<Partial<Pizza>>({}); // Stato per il form di dati
  const [categories, setCategories] = useState<Category[]>([]); // Stato per le categorie di pizza
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // Stato per gli ingredienti disponibili
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]); // Stato per gli ingredienti selezionati
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Stato per il file di immagine selezionato
  const { rawToken } = useAuth(); // Ottiene il token di autenticazione dall'AuthContextType
  const navigate = useNavigate(); // Ottiene la funzione di navigazione da react-router-dom

  // Effettua il fetch dei dati della pizza e dei dati necessari all'avvio del componente
  useEffect(() => {
    const fetchPizzaById = async () => {
      const savedToken = localStorage.getItem('token'); // Ottiene il token salvato nel localStorage
      try {
        const response = await axios.get(`https://localhost:7114/api/PizzaWebApi/GetPizzaById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${savedToken}`, // Imposta l'autorizzazione con il token
            'Content-Type': 'application/json' // Imposta il tipo di contenuto della richiesta
          }
        });
        setPizza(response.data); // Imposta i dati della pizza ottenuti dalla risposta
        setFormData(response.data); // Imposta i dati del form con i dati della pizza
        setSelectedIngredients(response.data.ingredienti); // Imposta gli ingredienti selezionati dalla pizza
      } catch (error) {
        console.error('Error fetching pizza by ID:', error); // Gestisce gli errori nel recupero dei dati della pizza
      }
    };

    const fetchData = async () => {
      try {
        const [categoriesResponse, ingredientsResponse] = await Promise.all([
          axios.get('https://localhost:7114/api/PizzaWebApi/GetAllCategories', {
            headers: {
              Authorization: `Bearer ${rawToken}`, // Imposta l'autorizzazione con il token
              'Content-Type': 'application/json' // Imposta il tipo di contenuto della richiesta
            }
          }),
          axios.get('https://localhost:7114/api/PizzaWebApi/GetAllIngredienti', {
            headers: {
              Authorization: `Bearer ${rawToken}`, // Imposta l'autorizzazione con il token
              'Content-Type': 'application/json' // Imposta il tipo di contenuto della richiesta
            }
          })
        ]);

        setCategories(categoriesResponse.data); // Imposta le categorie ottenute dalla risposta
        setIngredients(ingredientsResponse.data); // Imposta gli ingredienti ottenuti dalla risposta
      } catch (error) {
        console.error('Error fetching categories or ingredients', error); // Gestisce gli errori nel recupero di categorie o ingredienti
      }
    };

    fetchPizzaById(); // Chiama la funzione per recuperare i dati della pizza
    fetchData(); // Chiama la funzione per recuperare i dati di categorie e ingredienti
  }, [id, rawToken]); // Dipendenze per il caricamento dei dati

  // Gestisce il cambiamento di input nei campi del form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // Ottiene il nome e il valore dell'elemento modificato
    setFormData({ ...formData, [name]: value }); // Aggiorna lo stato del form con i nuovi dati
  };

  // Gestisce il cambiamento di file selezionato per l'immagine della pizza
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); // Imposta il file selezionato nello stato
    }
  };

  // Gestisce l'invio del form per aggiornare o salvare la pizza modificata
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previeni il comportamento di default dell'evento di submit
    const savedToken = localStorage.getItem('token'); // Ottiene il token salvato nel localStorage

    // Crea il payload per aggiornare o salvare la pizza
    const createPizzaPayload = (fotoUrl: string = ''): Pizza => ({
      id: pizza!.id, // ID della pizza
      nome: formData.nome!, // Nome della pizza
      descrizione: formData.descrizione!, // Descrizione della pizza
      fotoUrl, // URL dell'immagine della pizza
      prezzo: parseFloat(String(formData.prezzo)), // Prezzo della pizza convertito in float
      categoryId: formData.categoryId ? parseInt(String(formData.categoryId)) : undefined, // ID della categoria della pizza
      ingredienti: selectedIngredients.map(ingredient => ({
        id: ingredient.id, // ID dell'ingrediente
        Name: ingredient.name, // Nome dell'ingrediente
        Pizze: [] // Array vuoto, presumibilmente un placeholder
      }))
    });

    if (selectedFile) { // Se è stato selezionato un file per l'immagine
      const reader = new FileReader(); // Crea un oggetto FileReader
      reader.readAsDataURL(selectedFile); // Legge il file come URL data
      reader.onloadend = async () => { // Quando la lettura è completa
        const fotoUrl = reader.result as string; // Ottiene l'URL dell'immagine come stringa
        const updatedPizza = createPizzaPayload(fotoUrl); // Crea il payload aggiornato della pizza

        try {
          const response = await axios.put(`https://localhost:7114/api/PizzaWebApi/UpdatePizza/${id}`, updatedPizza, {
            headers: {
              Authorization: `Bearer ${savedToken}`, // Imposta l'autorizzazione con il token
              'Content-Type': 'application/json' // Imposta il tipo di contenuto della richiesta
            }
          });
          setPizza(response.data); // Imposta i dati della pizza aggiornati dalla risposta
          setIsEditing(false); // Disabilita la modalità di modifica
          navigate('/pizzas'); // Naviga alla pagina delle pizze
        } catch (error) {
          console.error('Error updating pizza:', error); // Gestisce gli errori nell'aggiornamento della pizza
        }
      };
    } else {
      const updatedPizza = createPizzaPayload(); // Crea il payload della pizza senza l'immagine

      try {
        const response = await axios.put(`https://localhost:7114/api/PizzaWebApi/UpdatePizza/${id}`, updatedPizza, {
          headers: {
            Authorization: `Bearer ${savedToken}`, // Imposta l'autorizzazione con il token
            'Content-Type': 'application/json' // Imposta il tipo di contenuto della richiesta
          }
        });
        setPizza(response.data); // Imposta i dati della pizza aggiornati dalla risposta
        setIsEditing(false); // Disabilita la modalità di modifica
        navigate('/pizzas'); // Naviga alla pagina delle pizze
      } catch (error) {
        console.error('Error updating pizza:', error); // Gestisce gli errori nell'aggiornamento della pizza
      }
    }
  };

  return (
    <div>
      {pizza ? ( // Se sono stati caricati i dati della pizza
        <div className='details-div'>
          <h1>Pizza Details</h1>
          {isEditing ? ( // Se è attiva la modalità di modifica
            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <strong>Nome:</strong>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Descrizione:</strong>
                <textarea
                  name="descrizione"
                  value={formData.descrizione || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Prezzo:</strong>
                <input
                  type="number"
                  name="prezzo"
                  value={formData.prezzo || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                />
              </div>
              <div className='mb-3'>
                <strong>Categoria:</strong>
                <select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleInputChange}
                  className='d-block w-100'
                >
                  <option value=''>Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>
              <div className='form-field'>
                <label>Image</label>
                <input type='file' onChange={handleFileChange} className='d-block w-100' />
              </div>
              <div className='mb-3'>
                <strong>Ingredienti:</strong>
                <select
                  multiple={true}
                  value={selectedIngredients.map(ingredient => ingredient.id.toString())}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                    const selectedIngredientObjects = selectedIds.map(id => ingredients.find(ingredient => ingredient.id.toString() === id)!);
                    setSelectedIngredients(selectedIngredientObjects);
                  }}
                  className='form-control mb-2 mr-sm-2 ml-sm-3 leftList'
                >
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id.toString()}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='text-end'>
                <button type="submit" className='btn btn-success mt-3'>Submit</button>
                <button type="button" onClick={() => setIsEditing(false)} className='btn btn-secondary mt-3'>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p>ID: {pizza.id}</p>
              <p>Nome: {pizza.nome}</p>
              <p>Descrizione: {pizza.descrizione}</p>
              <p>Prezzo: {pizza.prezzo} €</p>
              <img src={pizza.imgSrc || pizza.fotoUrl} alt={pizza.nome} />
              <div>
                <strong>Categoria:</strong>
                <p>{categories.find(category => category.id === pizza.categoryId)?.title}</p>
              </div>
              <div>
                <strong>Ingredienti:</strong>
                <ul>
                  {pizza.ingredienti.map(ingredient => (
                    <li key={ingredient.id}>{ingredient.Name}</li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setIsEditing(true)} className='btn btn-danger mt-3'>Modify</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DetailsPizza;




*/