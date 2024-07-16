import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import NotSignedIn from '../components/notSignedIn'

function DeleteUser({handleDelete,handleLogOut }) {
    const [enterError, setEnterError] = useState(false);
    const navigate = useNavigate();
    const [enteredUser, setEnteredUser] = useState('');
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);

    function handleModalToggle() {
        navigate('/dashboard');
    }

    const handleConfirmDelete = () => {
        if (user === enteredUser) {
            handleDelete();
            handleLogOut();
            navigate('/')
        } else {
            setEnterError(true);
        }
    };

    return ( loggedIn ? (
        <div className="signin">
            <div className="card">
                <div className="card-content">
                    <h1>Are you sure you want to delete your account?</h1>
                    <h5>Please enter your username below and press "confirm" if you do</h5>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Username"
                            value={enteredUser}
                            onChange={(e) => setEnteredUser(e.target.value)}
                        />
                    </div>
                    <div className="buttons">
                        <button className="btn btn-primary" onClick={handleConfirmDelete}>
                            Confirm
                        </button>
                        <button className="btn btn-primary" onClick={handleModalToggle}>
                            Cancel
                        </button>
                    </div>
                    {enterError && <h4 className="error-message">You entered your username wrong</h4>}
                </div>
            </div>
        </div>) : (
            <NotSignedIn />
        )
    );
}

export default DeleteUser;
