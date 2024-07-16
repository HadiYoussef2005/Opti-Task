import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar' 

function Dashboard({ handleLogOut }) {
    const [enterError, setEnterError] = useState(false)
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);
    const location = useLocation();
    const username = location.state ? location.state.username : '';
    const [enteredUser, setEnteredUser] = useState('');


    const handleModalToggle = () => {
        setModal(!modal); 
    };

    async function handleDelete() {
        try {
            const deleteUser = await fetch("http://localhost:3000/deleteUser", {
                method: "DELETE",
                headers: {
                    "Content-Type": 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({
                    username: user
                })
            });
            console.log(deleteUser)
            if (deleteUser.ok) {
                const logOut = await fetch("http://localhost:3000/logout", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (logOut.ok) {
                    console.log("User Deleted!")
                    handleLogOut();
                    navigate('/');
                } else {
                    console.error("There was a problem");
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!loggedIn) {
            navigate('/');
        }
    }, [loggedIn, navigate]);

    return (
                <>
                    <Navbar originalPage={'/dashboard'} handleLogOut={handleLogOut} />
                    <div className="flex-container">
                        <div className="control-bar">
                            <button className="control-items">
                                Add Item
                            </button>
                        </div>
                        <div className="todos">
                            <div className="todo-column">
                                <div className="priority">
                                    High
                                </div>
                            </div>
                            <div className="todo-column">
                                <div className="priority">
                                    Mid                                        
                                </div>
                            </div>
                            <div className="todo-column">
                                <div className="priority">
                                    Low                                        
                                </div>
                            </div>
                        </div>
                    </div>
                </>)}

export default Dashboard;
