import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ handleLogOut }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);
    const deleteUser = () => {
        navigate('/deleteuser'); 
    };
    const handleHome = () => {
        navigate('/')
    }

    return (
        <div className="navbar">
            <div className="navbar-left">
                <button className="navbar-btn" onClick={handleHome}>
                    Home
                </button>
            </div>
            <div className = "navbar-right">
                <button className="navbar-btn" onClick={handleLogOut}>
                    Logout
                </button>
                <button className="navbar-btn" onClick={deleteUser}>Delete Account</button>
            </div>
        </div>
    );
}

export default Navbar;
