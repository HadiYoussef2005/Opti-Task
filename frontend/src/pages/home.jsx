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
        <div className="home">
            <div className="home-item">
                <div className="title">Welcome to Opti-Task</div>
            </div>
            <div className="home-item">
                <h4 className="header">Please register/login below</h4>
                <button className="btn" onClick={handleRegister}>Register</button>
                <button className="btn" onClick={handleLogin}>Login</button>
            </div>
        </div>    
    );
}

export default Home;
