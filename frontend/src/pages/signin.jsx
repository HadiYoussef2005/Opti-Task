import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SignIn() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [register, setRegister] = useState(state ? state.register : false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function handleBackHome() {
        navigate('/');
    }

    async function handleLogin(username, password) {
        if (!password || !username){
            setError(true);
            setErrorMessage("All fields must be filled");
        } else {
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username:username,
                        password:password
                    })
                });
                const data = await response.json();
                if(response.ok){
                    if(data.message === "Login Successful") {
                        console.log(data.message);
                        navigate('/');
                    } else {
                        setError(true);
                        setErrorMessage(data.message);
                    }
                } else {
                    setError(true);
                    setErrorMessage(data.message);
                }
            } catch(error) {
                setError(true);
                setErrorMessage("An error occurred. Please try again.");
            }
        }
    }

    async function handleRegister(username, password, confirm) {
        if (password !== confirm) {
            setError(true);
            setErrorMessage("Passwords must match");
        } else if (!password || !confirm || !username) {
            setError(true);
            setErrorMessage("All fields must be filled");
        } else {
            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    if (data.message !== `User registered with username of ${username}`) {
                        setError(true);
                        setErrorMessage(data.message);
                    } else {
                        setError(false);
                        setErrorMessage('');
                        console.log("User registered successfully");
                    }
                } else {
                    setError(true);
                    setErrorMessage(data.message || "Registration failed");
                }
                console.log(data);
            } catch (error) {
                setError(true);
                setErrorMessage("An error occurred. Please try again.");
                console.error("Error:", error);
            }
        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <h1 className="card-title">{register ? 'Register' : 'Login'}</h1>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {register && (
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            id="confirm"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>
                )}
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (register) {
                            handleRegister(username, password, confirm);
                        } else {
                            handleLogin(username, password);
                        }
                    }}
                >
                    {register ? 'Register' : 'Login'}
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setRegister(!register);
                        setUsername('');
                        setPassword('');
                        setConfirm('');
                        setError(false);
                        setErrorMessage('');
                    }}
                >
                    {register ? 'Switch to Login' : 'Switch to Register'}
                </button>
                {error && <div className="error-message"><h3>{errorMessage}</h3></div>}
            </div>
            <button to="/" className="btn" onClick={handleBackHome}>Back Home</button>
        </div>
    );
}

export default SignIn;
