import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

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
            {loggedIn ? (
                <>
                {!modal? (
                <>
                    <h1>Welcome {user}</h1>
                    <button className="btn btn-primary" onClick={handleModalToggle}>
                        Delete Account
                    </button>
                    <button className="btn btn-primary" onClick={handleLogOut}>
                        Logout
                    </button>
                </>
                ): (
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
                                <button className="btn btn-primary" onClick={()=>{
                                    if(user == enteredUser){
                                        handleDelete()
                                    }
                                    else{
                                        setEnterError(true)
                                    }
                                }
                                }>
                                    Confirm
                                </button>
                                <button className="btn btn-secondary" onClick={handleModalToggle}>
                                    Cancel
                                </button>
                                {enterError ? (<h4 className="error-message">You entered your username wrong</h4>):(null)}
                            </div>
                        </div>
                    )}
                </>
            ) : null}
        </>
    );
}

export default Dashboard;
