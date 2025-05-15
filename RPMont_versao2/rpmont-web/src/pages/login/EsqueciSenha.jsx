import React from 'react'
import { Link } from 'react-router-dom';
import "./login.css";
import logo from "../../assets/RPMontBrasao.png";
import planoDeFundo from "../../assets/planoDeFundo8.png"

const EsqueciSenha = () => {

  return (
    <div className='row'>
        <div className='col-sm-5 d-flex justify-content-center align-items-center text-center'>
            <form className='form-signin'>
                <img src={logo} className='logo mb-2' />
                <h5 className='mb-3'>Regimento de Polícia Montada Coronel Calixto</h5>
                <h5 className='mb-3 text-secondary'>Informe o e-mail</h5>

                <div>
                    <input type='email' placeholder='E-mail' className='form-control' />
                </div>                
                <div className='mt-3'>
                    <button className='btn btn-primary w-100'>enviar</button>
                </div>  
                <div className='mt-4'>
                    <Link to='/'>Acessar sistema</Link>
                </div>                              
            </form>              
        </div>
        <div className='col-sm-7'>
            <img src={planoDeFundo} className='background-login' />
        </div>
        
    </div>
  )
}

export default EsqueciSenha