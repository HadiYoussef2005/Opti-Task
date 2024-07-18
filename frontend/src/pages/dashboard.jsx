import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar';
import NotSignedIn from '../components/notSignedIn';

function Dashboard({ handleLogOut }) {
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(UserContext);
    const [todos, setTodos] = useState({ high: [], medium: [], low: [] });

    const filterDate = (dueDate) => {
        if (!dueDate || typeof dueDate !== 'string') {
            console.error('Invalid dueDate:', dueDate);
            return { dayStr: '', timeStr: '', overdue: false, today: false, tomorrow: false, timeLeft: 0, other: false };
        }
    
        const now = new Date();
        const nowUtc = new Date(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds()
        );
    
        const dueDateTime = new Date(dueDate);
        const localDate = new Date(dueDateTime.toLocaleString());
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(localDate.getDate()).padStart(2, '0');
        let localHour = localDate.getHours();
        let localMin = localDate.getMinutes();
    
        let flag = true;
        let amOrPm = "";
    
        // Adjust localHour and determine amOrPm
        if (localHour <= 4) {
            localHour = (localHour - 4) + 12;
            amOrPm = "PM";
            flag = false;
        } else {
            localHour -= 4;
        }
    
        if (localHour >= 12 && flag) {
            amOrPm = "PM";
            if (localHour > 12) {
                localHour -= 12;
            }
        } else if (localHour < 12 && flag) {
            amOrPm = "AM";
            if (localHour === 0) {
                localHour = 12;
            }
        }
    
        const timeStr = `${String(localHour).padStart(2, '0')}:${String(localMin).padStart(2, '0')} ${amOrPm}`;
    
        const overdue = (localHour < now.getHours()) || (localHour === now.getHours() && localMin < now.getMinutes());
    
        const today = dueDateTime.toDateString() === now.toDateString();
        const tomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === dueDateTime.toDateString();
    
        const timeDiff = dueDateTime.getTime() - nowUtc.getTime() - 1;
        const timeLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
        const other = !today && !tomorrow && !overdue;
    
        return { dayStr, timeStr, overdue, today, tomorrow, timeLeft, other };
    };

    function handleEdit (title, date, time, priority, completed)  {
        const url = `/todoedit?title=${encodeURIComponent(title)}&dayStr=${encodeURIComponent(date)}&timeStr=${encodeURIComponent(time)}&priority=${encodeURIComponent(priority)}&completed=${encodeURIComponent(completed.toString())}`;
        navigate(url);
    }
    

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
                console.error("HTTP error");
            }
        } catch (error) {
            console.error("Error during PUT request:", error);
        }
    }
    const handleAddItem = () => {
        navigate('/additem');
    };

    const handleDelete = async (user, title) => {
        try{
            const response = await fetch("http://localhost:3000/item", {
                method: "DELETE",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    user: user,
                    title: title
                })
            })
            if(response.ok){
                console.log(response.status);
            } else {
                console.error("There was an unexpected error");
            }
        } catch (e) {
            console.error(e);
        }
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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''} ${(!todo.completed && filterDate(todo.dueDate).overdue) ? 'overdue' : ''}`}>
                                        <div className="todo-item-left">
                                            <span>{todo.title}</span>
                                        </div>
                                        <div className="todo-item-middle">
                                            {(todo.completed) && (
                                                <span>Completed</span>
                                            )}
                                            {(filterDate(todo.dueDate).today && !filterDate(todo.dueDate).overdue && !todo.completed) && (
                                                <span>Due today at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                                <span>Due tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).other && !todo.completed && (
                                                <span>Due in {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {(filterDate(todo.dueDate).overdue && !todo.completed) && (
                                                <span>Overdue</span>
                                            )}
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
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await handleDelete(user, todo.title);

                                                        setTodos(prevTodos => ({
                                                            ...prevTodos,
                                                            [todo.priority]: prevTodos[todo.priority].filter(item => item.title !== todo.title)
                                                        }));
                                                    } catch (error) {
                                                        console.error('Error deleting item:', error);
                                                    }
                                                }}
                                                className="btn-delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            <button className="menu-button" onClick={()=>{handleEdit(todo.title, todo.dueDate, todo.dueTime, todo.priority, todo.completed)}}>
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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''} ${(!todo.completed && filterDate(todo.dueDate).overdue) ? 'overdue' : ''}`}>
                                    <div className="todo-item-left">
                                        <span>{todo.title}</span>
                                    </div>
                                    <div className="todo-item-middle">
                                        {(todo.completed) && (
                                            <span>Completed</span>
                                        )}
                                        {(filterDate(todo.dueDate).today && !filterDate(todo.dueDate).overdue && !todo.completed) && (
                                            <span>Due today at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                            <span>Due tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {filterDate(todo.dueDate).other && !todo.completed && (
                                            <span>Due in {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {(filterDate(todo.dueDate).overdue && !todo.completed) && (
                                            <span>Overdue</span>
                                        )}
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
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await handleDelete(user, todo.title);

                                                    setTodos(prevTodos => ({
                                                        ...prevTodos,
                                                        [todo.priority]: prevTodos[todo.priority].filter(item => item.title !== todo.title)
                                                    }));
                                                } catch (error) {
                                                    console.error('Error deleting item:', error);
                                                }
                                            }}
                                            className="btn-delete"
                                        >
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
                                    <div key={todo.title} className={`todo-item ${todo.completed ? 'checked' : ''} ${(!todo.completed && filterDate(todo.dueDate).overdue) ? 'overdue' : ''}`}>
                                    <div className="todo-item-left">
                                        <span>{todo.title}</span>
                                    </div>
                                    <div className="todo-item-middle">
                                        {(todo.completed) && (
                                            <span>Completed</span>
                                        )}
                                        {(filterDate(todo.dueDate).today && !filterDate(todo.dueDate).overdue && !todo.completed) && (
                                            <span>Due today at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                            <span>Due tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {filterDate(todo.dueDate).other && !todo.completed && (
                                            <span>Due in {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
                                        )}
                                        {(filterDate(todo.dueDate).overdue && !todo.completed) && (
                                            <span>Overdue</span>
                                        )}
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
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await handleDelete(user, todo.title);

                                                    setTodos(prevTodos => ({
                                                        ...prevTodos,
                                                        [todo.priority]: prevTodos[todo.priority].filter(item => item.title !== todo.title)
                                                    }));
                                                } catch (error) {
                                                    console.error('Error deleting item:', error);
                                                }
                                            }}
                                            className="btn-delete"
                                        >
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