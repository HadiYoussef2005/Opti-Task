import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function SignIn({ handleLogOut }) {
    const { user, loggedIn, setLoggedIn, setUser } = useContext(UserContext);
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

    function handleToDashboard(){
        navigate('/dashboard');
    }
    
    async function handleLogin(username, password) {
        if (!password || !username) {
          setError(true);
          setErrorMessage(`All fields must be filled`);
        } else {
          try {
            const response = await fetch('http://localhost:3000/login', {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: username,
                password: password
              }),
              credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
              if (data.message === `Login Successful`) {
                console.log(data.message);
                setLoggedIn(true);
                setUser(username);
                navigate('/dashboard', { replace: true }); 
              } else {
                setError(true);
                setErrorMessage(data.message);
              }
            } else {
              setError(true);
              setErrorMessage(data.message);
            }
          } catch (error) {
            setError(true);
            setErrorMessage(`An error occurred. Please try again.`);
          }
        }
      }

      async function handleRegister(username, password, confirm) {
        if (password !== confirm) {
            setError(true);
            setErrorMessage(`Passwords must match`);
        } else if (!password || !confirm || !username) {
            setError(true);
            setErrorMessage(`All fields must be filled`);
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
                    setError(false);
                    setErrorMessage('');
                    console.log("User registered successfully");
                    
                    const loginResponse = await fetch('http://localhost:3000/login', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: username,
                            password: password
                        }),
                        credentials: 'include'
                    });
                    
                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        setLoggedIn(true);
                        setUser(username);
                        navigate('/dashboard', { replace: true });
                    } else {
                        setError(true);
                        setErrorMessage("Login after registration failed");
                    }
                } else {
                    setError(true);
                    setErrorMessage(data.message || "Registration failed");
                }
            } catch (error) {
                setError(true);
                setErrorMessage(`An error occurred. Please try again.`);
                console.error("Error:", error);
            }
        }
    }
    

    return (
        <>
            {!loggedIn ? (
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
            ) : (
                <div className="card">
                    <div className="card-body">
                        <h1 className="card-title">You are logged in as {user}</h1>
                        <button
                            className="btn btn-primary"
                            onClick={() => { handleLogOut() }}
                        >
                            Logout
                        </button>
                        <button to="/" className="btn btn-primary" onClick={handleToDashboard}>To Dashboard</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default SignIn;
