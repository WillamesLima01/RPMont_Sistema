import React from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/global.css"
import Rotas from './rotas.jsx';
//import Teste from './pages/veterinaria/teste.jsx';

createRoot(document.getElementById('root')).render(
  <Rotas />
  //<Teste />
)