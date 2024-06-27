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
  ingredienti: { id: number, name: string, Pizze: any[] }[];
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
        name: ingredient.name,
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

  
  useEffect(() =>{
    console.log("pizza", pizza);
  },[formData, pizza])

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
                        name: ingredient.name,
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
              <p>Ingredienti:</p>
              {pizza.ingredienti.map((x, index) => (<p key={index}>{x.name}</p>))}
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