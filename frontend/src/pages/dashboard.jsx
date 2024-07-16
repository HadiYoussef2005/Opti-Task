import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import Navbar from '../components/Navbar' 
import NotSignedIn from '../components/notSignedIn';

function Dashboard({ handleLogOut }) {
    const navigate = useNavigate();
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);

    const handleAddItem = () => {
        navigate('/additem')
    }

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
                            </div>
                            <div className="todo-column">
                                <div className="priority">
                                    Medium                                        
                                </div>
                            </div>
                            <div className="todo-column">
                                <div className="priority">
                                    Low                                        
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <NotSignedIn />
            )
                
            )}

export default Dashboard;
