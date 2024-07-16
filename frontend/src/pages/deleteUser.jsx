import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function DeleteUser({handleDelete,handleLogOut }) {
    const [enterError, setEnterError] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [enteredUser, setEnteredUser] = useState('');
    function handleModalToggle() {
        navigate(originalPage);
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

    return (
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
                    <button className="btn btn-primary" onClick={handleConfirmDelete}>
                        Confirm
                    </button>
                    <button className="btn btn-primary" onClick={handleModalToggle}>
                        Cancel
                    </button>
                    {enterError && <h4 className="error-message">You entered your username wrong</h4>}
                </div>
            </div>
        </div>
    );
}

export default DeleteUser;
