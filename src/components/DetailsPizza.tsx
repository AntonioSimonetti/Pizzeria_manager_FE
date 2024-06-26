import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Pizza {
  id: number;
  nome: string;
  descrizione: string;
  fotoUrl: string;
  imgSrc: string;
  prezzo: number;
  categoryId: number;
}

const DetailsPizza: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pizza, setPizza] = useState<Pizza | null>(null);

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
      } catch (error) {
        console.error('Error fetching pizza by ID:', error);
      }
    };

    fetchPizzaById();
  }, [id]);

  return (
    <div>
      {pizza ? (
        <div className='details-div'>
        <h1>Pizza Details</h1>
          <p>ID: {pizza.id}</p>
          <p>Nome: {pizza.nome}</p>
          <p>Descrizione: {pizza.descrizione}</p>
          <p>Prezzo: {pizza.prezzo} €</p>
          <img src={pizza.imgSrc || pizza.fotoUrl} alt={pizza.nome} />
          <button className='btn btn-danger mt-3'>Modify</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DetailsPizza;

