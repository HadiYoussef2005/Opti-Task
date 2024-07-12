import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate('/signin', { state: { register: true } });
    };

    const handleLogin = () => {
        navigate('/signin', { state: { register: false } });
    };

    return (
        <>
            <div className="title">This is a Todo List App</div>
            <h4 className="header">Please register/login below</h4>
            <button className="btn" onClick={handleRegister}>Register</button>
            <button className="btn" onClick={handleLogin}>Login</button>
        </>    
    );
}

export default Home;
