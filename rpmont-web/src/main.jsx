import React from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/global.css"
import Rotas from './rotas.jsx';
import VeterinariaEquinoList from './pages/veterinaria/VeterinariaEquinoList.jsx';

createRoot(document.getElementById('root')).render(

  <Rotas /> 
  
)