import React from 'react';
import { useLocation } from 'react-router-dom';

function Dashboard() {
    const location = useLocation();
    const username = location.state ? location.state.username : '';

    return (
        <div>
            <h1 className="title">Welcome {username}</h1>
        </div>
    );
}

export default Dashboard;
