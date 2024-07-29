import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar';
import NotSignedIn from '../components/notSignedIn';

function Dashboard({ handleLogOut }) {
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(UserContext);
    const [todos, setTodos] = useState({ high: [], medium: [], low: [] });

    const handleCalendar = async () => {
        try{
            const response = await fetch('http://localhost:3000/make-my-calendar', {
                method: "GET",
                headers: {
                    "Content-Type":"application/json"
                },
                credentials:"include"
            })
            if (response.ok){
                console.log(response);
            }
        } catch (error) { 
            console.error(error);
        }
    }

    const filterDate = (dueDate) => {
        console.log(dueDate);
        if (!dueDate || typeof dueDate !== 'string') {
            console.error('Invalid dueDate:', dueDate);
            return { dayStr: '', timeStr: '', overdue: false, today: false, tomorrow: false, timeLeft: 0, other: false };
        }
        console.log("Due date: ", dueDate);
        const now = new Date();
        const dueDateTime = new Date(dueDate);
        dueDateTime.setHours(dueDateTime.getHours());
        console.log("Original", dueDateTime);

        const year = dueDateTime.getFullYear();
        const month = String(dueDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dueDateTime.getDate()).padStart(2, '0');

        const dayStr = `${year}-${month}-${day}`;

        let localHour = dueDateTime.getHours();
        let localMin = dueDateTime.getMinutes();
        let flag = true;
        let amOrPm = "AM";

        if (localHour >= 12) {
            if (localHour > 12){
                localHour -= 12;
            }
            amOrPm = "PM"
        } 
            else if (localHour === 0) {
            localHour = 12;
        }

        const timeStr = `${String(localHour).padStart(2, '0')}:${String(localMin).padStart(2, '0')} ${amOrPm}`;

        console.log(dueDateTime);
        console.log(now);
        const isOverdue = dueDateTime < now;
        const isToday = dueDateTime.toDateString() === now.toDateString();
        const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === dueDateTime.toDateString();

        const overdue = isOverdue;
        const today = isToday && !isOverdue;
        const tomorrow = isTomorrow && !isOverdue;

        const start = new Date(dueDateTime);
        const end = new Date(now);

        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);

        const timeDiff = start-end;
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const timeLeft = Math.floor(timeDiff / millisecondsInDay);

        const other = !today && !tomorrow && !overdue;

        return { dayStr, timeStr, overdue, today, tomorrow, timeLeft, other };
    };

    function handleEdit(uuid, title, date, time, priority, completed, hours, todoLength) {
        const url = `/edittodo?uuid=${encodeURIComponent(uuid)}&title=${encodeURIComponent(title)}&dayStr=${encodeURIComponent(date)}&timeStr=${encodeURIComponent(time)}&priority=${encodeURIComponent(priority)}&completed=${encodeURIComponent(completed.toString())}&hours=${encodeURIComponent(hours)}&length=${encodeURIComponent(todoLength)}`;
        navigate(url);
    }

    const handleCheck = async (uuid, title, dateTime, priority, completed) => {
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
                    uuid: uuid,
                    newTitle: null,
                    dueDate: null,
                    dueTime: null,
                    priority: null,
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

    const handleDelete = async (user, uuid) => {
        try {
            const response = await fetch("http://localhost:3000/item", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: user,
                    uuid: uuid
                })
            });
            if (response.ok) {
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
                                                <span>Today at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                                <span>Tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).other && !todo.completed && (
                                                <span>In {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
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
                                                    handleCheck(todo.uuid, todo.title, todo.dueDate, todo.priority, todo.completed);
                                                    setTodos(prevTodos => ({
                                                        ...prevTodos,
                                                        [todo.priority]: prevTodos[todo.priority].map(item =>
                                                            item.uuid === todo.uuid ? { ...item, completed: !todo.completed } : item
                                                        )
                                                    }));
                                                }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await handleDelete(user, todo.uuid);

                                                        setTodos(prevTodos => ({
                                                            ...prevTodos,
                                                            [todo.priority]: prevTodos[todo.priority].filter(item => item.uuid !== todo.uuid)
                                                        }));
                                                    } catch (error) {
                                                        console.error('Error deleting item:', error);
                                                    }
                                                }}
                                                className="btn-delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            <button className="menu-button" onClick={() => { handleEdit(todo.uuid, todo.title, filterDate(todo.dueDate).dayStr, filterDate(todo.dueDate).timeStr, todo.priority, todo.completed, todo.hours, todo.eventLength) }}>
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
                                    <div key={todo.uuid} className={`todo-item ${todo.completed ? 'checked' : ''} ${(!todo.completed && filterDate(todo.dueDate).overdue) ? 'overdue' : ''}`}>
                                        <div className="todo-item-left">
                                            <span>{todo.title}</span>
                                        </div>
                                        <div className="todo-item-middle">
                                            {(todo.completed) && (
                                                <span>Completed</span>
                                            )}
                                            {(filterDate(todo.dueDate).today && !filterDate(todo.dueDate).overdue && !todo.completed) && (
                                                <span>Today at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                                <span>Tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).other && !todo.completed && (
                                                <span>In {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
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
                                                    handleCheck(todo.uuid, todo.title, todo.dueDate, todo.priority, todo.completed);
                                                    setTodos(prevTodos => ({
                                                        ...prevTodos,
                                                        [todo.priority]: prevTodos[todo.priority].map(item =>
                                                            item.uuid === todo.uuid ? { ...item, completed: !todo.completed } : item
                                                        )
                                                    }));
                                                }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await handleDelete(user, todo.uuid);
                                                        setTodos(prevTodos => ({
                                                            ...prevTodos,
                                                            [todo.priority]: prevTodos[todo.priority].filter(item => item.uuid !== todo.uuid)
                                                        }));
                                                    } catch (error) {
                                                        console.error('Error deleting item:', error);
                                                    }
                                                }}
                                                className="btn-delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            <button className="menu-button" onClick={() => { handleEdit(todo.uuid, todo.title, filterDate(todo.dueDate).dayStr, filterDate(todo.dueDate).timeStr, todo.priority, todo.completed, todo.hours, todo.eventLength) }}>
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
                                    <div key={todo.uuid} className={`todo-item ${todo.completed ? 'checked' : ''} ${(!todo.completed && filterDate(todo.dueDate).overdue) ? 'overdue' : ''}`}>
                                        <div className="todo-item-left">
                                            <span>{todo.title}</span>
                                        </div>
                                        <div className="todo-item-middle">
                                            {(todo.completed) && (
                                                <span>Completed</span>
                                            )}
                                            {(filterDate(todo.dueDate).today && !filterDate(todo.dueDate).overdue && !todo.completed) && (
                                                <span>Today at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).tomorrow && !todo.completed && (
                                                <span>Tomorrow at {filterDate(todo.dueDate).timeStr}</span>
                                            )}
                                            {filterDate(todo.dueDate).other && !todo.completed && (
                                                <span>In {filterDate(todo.dueDate).timeLeft} days at {filterDate(todo.dueDate).timeStr}</span>
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
                                                    handleCheck(todo.uuid, todo.title, todo.dueDate, todo.priority, todo.completed);
                                                    setTodos(prevTodos => ({
                                                        ...prevTodos,
                                                        [todo.priority]: prevTodos[todo.priority].map(item =>
                                                            item.uuid === todo.uuid ? { ...item, completed: !todo.completed } : item
                                                        )
                                                    }));
                                                }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await handleDelete(user, todo.uuid);
                                                        setTodos(prevTodos => ({
                                                            ...prevTodos,
                                                            [todo.priority]: prevTodos[todo.priority].filter(item => item.uuid !== todo.uuid)
                                                        }));
                                                    } catch (error) {
                                                        console.error('Error deleting item:', error);
                                                    }
                                                }}
                                                className="btn-delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            <button className="menu-button" onClick={() => { handleEdit(todo.uuid, todo.title, filterDate(todo.dueDate).dayStr, filterDate(todo.dueDate).timeStr, todo.priority, todo.completed, todo.hours, todo.eventLength) }}>
                                                &#x22EE;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="center-button">
                        <button className="btn" onClick={handleCalendar}>Add to calendar</button>
                    </div>
                </div>
            </>
        ) : (
            <NotSignedIn />
        )
    );
}

export default Dashboard;
