import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import "./login.css";
import logo from "../../assets/RPMontBrasao.png";
import planoDeFundo from "../../assets/planoDeFundo8.png"

const Login = () => {

    const navigate = useNavigate()

    const ExecuteLogin =()=> {
        navigate("/inicio");
    }

  return (
    <div className='row'>
        <div className='col-sm-5 d-flex justify-content-center align-items-center text-center'>
            <form className='form-signin'>
                <img src={logo} className='logo mb-2' />
                <h5 className='mb-3'>Regimento de Polícia Montada Coronel Calixto</h5>
                <h5 className='mb-3 text-secondary'>Acesse sua conta</h5>

                <div>
                    <input type='email' placeholder='E-mail' className='form-control' />
                </div>
                <div className='mt-3'>
                    <input type='password' placeholder='Senha' className='form-control' />
                </div>
                <div className='mt-3'>
                    <button onClick={ExecuteLogin} className='btn btn-primary w-100' type='button'>Login</button>
                </div>
                <div className='mt-4'>
                    <Link to='/esqueciSenha'>Esqueci minha senha</Link>
                </div>
            </form>
              
        </div>
        <div className='col-sm-7'>
            <img src={planoDeFundo} className='background-login' />
        </div>
        
    </div>
  )
}

export default Login