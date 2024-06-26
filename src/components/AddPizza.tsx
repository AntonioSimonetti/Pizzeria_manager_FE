import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContextType';

interface Category {
  id: number;
  title: string;
}

interface Ingredient {
  id: number;
  name: string;
  Pizze: any[]; // Assicurati che questo sia il tipo corretto per le pizze
}

interface Pizza {
    nome: string;
    descrizione: string;
    fotoUrl?: string;
    prezzo: number;
    categoryId?: number;
    ingredienti: { id: number/*, Name: string, Pizze: [] */}[]; 
  }

const PizzaForm: React.FC = () => {
  const { rawToken } = useAuth();
  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories and ingredients
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
          console.log('Categories:', categoriesResponse.data);
          console.log('Ingredients:', ingredientsResponse.data);

          const updatedIngredients = ingredientsResponse.data.map((ingredient: any) => ({
            id: ingredient.id,
            name: ingredient.name,
            Pizze: ingredient.pizze
          }));
          setIngredients(updatedIngredients);



          setCategories(categoriesResponse.data);
          setIngredients(updatedIngredients);
        } catch (error) {
          console.error('Error fetching categories or ingredients', error);
        }
      };

    fetchData();
  }, [rawToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("selectedIngredients: ", selectedIngredients);
  // Ottieni gli oggetti completi degli ingredienti selezionati
  const selectedIngredientsList = selectedIngredients.map(ingredient => ({
    id: ingredient.id,
    name: ingredient.name,
    Pizze: []
  }));

    const createPizzaPayload = (fotoUrl: string = ''): Pizza => ({
      nome,
      descrizione,
      fotoUrl,
      prezzo: parseFloat(prezzo),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      ingredienti: selectedIngredients.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        Pizze: []
      }))    });

    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const fotoUrl = reader.result as string;
        const newPizza = createPizzaPayload(fotoUrl);

        console.log("Payload to be sent with image:", newPizza);

        try {
          await axios.post('https://localhost:7114/api/PizzaWebApi/InsertPizza', newPizza, {
            headers: { Authorization: `Bearer ${rawToken}` }
          });
          navigate('/pizzas');
        } catch (err) {
          console.error('Errore durante l\'inserimento della pizza', err);
        }
      };
    } else {
      const newPizza = createPizzaPayload();

      console.log("Payload to be sent without image:", newPizza);

      try {
        await axios.post('https://localhost:7114/api/PizzaWebApi/InsertPizza', newPizza, {
          headers: { Authorization: `Bearer ${rawToken}` }
        });
        navigate('/pizzas');
      } catch (err) {
        console.error('Errore durante l\'inserimento della pizza', err);
      }
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  return (
    <div className='main-div'>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <strong>Nome:</strong>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className='d-block w-100' />
        </div>
        <div className='mb-3'>
          <strong>Descrizione:</strong>
          <input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} className='d-block w-100' />
        </div>
        <div className='mb-3'>
          <strong>Prezzo:</strong>
          <input value={prezzo} onChange={(e) => setPrezzo(e.target.value)} className='d-block w-100' />
        </div>
        <div className='mb-3'>
          <strong>Categoria:</strong>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className='d-block w-100'>
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
            value={selectedIngredients.map(ingredient => ingredient.id.toString())} // Imposta gli ID come valori selezionati
            onChange={(e) => {
              const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
              const selectedIngredientObjects = selectedIds.map(id => ingredients.find(ingredient => ingredient.id.toString() === id)!); // Trova gli oggetti Ingredient corrispondenti agli ID selezionati

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
          <input type='submit' className='btn btn-small btn-info' value='Aggiungi' />
        </div>
      </form>
      <a href='/pizzas'>Back</a>
    </div>
  );
};

export default PizzaForm;
