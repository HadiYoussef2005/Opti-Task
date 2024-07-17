import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar';
import NotSignedIn from '../components/notSignedIn';

function Dashboard({ handleLogOut }) {
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(UserContext);
    const [todos, setTodos] = useState({ high: [], medium: [], low: [] });

    // Function to update todo item completion status
    const handleCheck = async (title, dateTime, priority, completed) => {
        let dateTimeArr = dateTime.split("T");
        let date = dateTimeArr[0];
        let time = dateTimeArr[1];
        try {
            const response = await fetch('http://localhost:3000/item', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: user,
                    title: title,
                    newTitle: title,
                    dueDate: date,
                    dueTime: time,
                    priority: priority,
                    completed: !completed
                })
            });

            if (response.ok) {
                console.log("Item updated successfully");
            } else {
                console.error("HTTP error:", response.status);
            }
        } catch (error) {
            console.error("Error during PUT request:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/items?user=${user}`);
                if (response.ok) {
                    const data = await response.json();
                    setTodos(data);
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Unexpected Error:', error);
            }
        };

        fetchData();
    }, [user]);

    const handleAddItem = () => {
        navigate('/additem');
    };

    const handleDelete = (title) => {
        console.log(`Deleting item: ${title}`);
    };

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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''}`}>
                                    <div className="todo-item-left">
                                        <span>{todo.title}</span>
                                    </div>
                                    <div className="todo-item-middle">
                                        <span>{todo.dueDate}</span>
                                    </div>
                                    <div className="todo-item-right">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => {
                                                handleCheck(todo.title, todo.dueDate, todo.priority); 
                                                setTodos(prevTodos => ({
                                                    ...prevTodos,
                                                    [todo.priority]: prevTodos[todo.priority].map(item =>
                                                        item.title === todo.title ? { ...item, completed: !todo.completed } : item
                                                    )
                                                }));}}
                                        />
                                        <button className="btn-delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button className="menu-button" onClick={() => console.log("this works")}>
                                            &#x22EE;
                                        </button>
                                    </div>
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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''}`}>
                                    <div className="todo-item-left">
                                        <span>{todo.title}</span>
                                    </div>
                                    <div className="todo-item-middle">
                                        <span>{todo.dueDate}</span>
                                    </div>
                                    <div className="todo-item-right">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => {
                                                handleCheck(todo.title, todo.dueDate, todo.priority); 
                                                setTodos(prevTodos => ({
                                                    ...prevTodos,
                                                    [todo.priority]: prevTodos[todo.priority].map(item =>
                                                        item.title === todo.title ? { ...item, completed: !todo.completed } : item
                                                    )
                                                }));}}
                                        />
                                        <button className="btn-delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button className="menu-button" onClick={() => console.log("this works")}>
                                            &#x22EE;
                                        </button>
                                    </div>
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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''}`}>
                                    <div className="todo-item-left">
                                        <span>{todo.title}</span>
                                    </div>
                                    <div className="todo-item-middle">
                                        <span>{todo.dueDate}</span>
                                    </div>
                                    <div className="todo-item-right">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => {
                                                handleCheck(todo.title, todo.dueDate, todo.priority); 
                                                setTodos(prevTodos => ({
                                                    ...prevTodos,
                                                    [todo.priority]: prevTodos[todo.priority].map(item =>
                                                        item.title === todo.title ? { ...item, completed: !todo.completed } : item
                                                    )
                                                }));}}
                                        />
                                        <button className="btn-delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <button className="menu-button" onClick={() => console.log("this works")}>
                                            &#x22EE;
                                        </button>
                                    </div>
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

