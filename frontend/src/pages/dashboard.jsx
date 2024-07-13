import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function Dashboard() {
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(UserContext);
    const location = useLocation();
    const username = location.state ? location.state.username : '';

    return (
        <>
            {loggedIn ? <h1>Welcome {user}</h1> : <h1>Loading...</h1>}
        </>
    );
}

export default Dashboard;
