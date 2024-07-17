import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar';
import NotSignedIn from '../components/notSignedIn';

function Dashboard({ handleLogOut }) {
    const navigate = useNavigate();
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);
    const [todos, setTodos] = useState({ high: [], medium: [], low: [] });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:3000/items?user=${user}`);
                if (response.ok) {
                    const data = await response.json();
                    setTodos(data); 
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Unexpected Error:', error);
            }
        }
        fetchData();
    }, [user]); 

    const handleAddItem = () => {
        navigate('/additem');
    };

    return (
        loggedIn ? (
            <>
                <Navbar originalPage={'/dashboard'} handleLogOut={handleLogOut} />
                <div className="flex-container">
                    <div className="control-bar">
                        <button className="control-items" onClick={handleAddItem}>
                            Add Item
                        </button>
                    </div>
                    <div className="todos">
                        <div className="todo-column">
                            <div className="priority">
                                High
                            </div>
                            <div className="todo-items">
                                {todos.high.map(todo => (
                                        <div key={todo.title} className="todo-item">
                                            <span>{todo.title}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="todo-column">
                            <div className="priority">
                                Medium
                            </div>
                            <div className="todo-items">
                                {todos.medium.map(todo => (
                                        <div key={todo.title} className="todo-item">
                                            <span>{todo.title}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="todo-column">
                            <div className="priority">
                                Low
                            </div>
                            <div className="todo-items">
                                {todos.low.map(todo => (
                                        <div key={todo.title} className="todo-item">
                                            <span>{todo.title}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <NotSignedIn />
        )
    );
}

export default Dashboard;
