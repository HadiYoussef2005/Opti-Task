import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function Dashboard() {
    const navigate = useNavigate();
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);
    const location = useLocation();
    const username = location.state ? location.state.username : '';
    async function handleDelete(){
        try{
            const deleteUser = await fetch("http://localhost:3000/deleteUser", {
                method: "DELETE",
                headers: {
                    "Content-Type":'application/json'
                },
                credentials: "include",
                body: JSON.stringify({
                    username: user
                })
            });
            console.log(deleteUser)
            if(deleteUser.ok) {
                const logOut = await fetch("http//localhost:3000/logout", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if(logOut.ok) {
                    console.log("User Deleted!")
                    setLoggedIn(false)
                    setUser('')
                    navigate('/')
                }
                else{
                    console.error("There was a problem")
                }
            }
        } catch(error){
            console.error(error);
        }
    }

    return (
        <>
            {loggedIn ? <>
                <h1>Welcome {user}</h1> 
                <button className="btn btn-primary" onClick={handleDelete}>Delete Account</button>
            </>
            : 
            <h1>Loading...</h1>}
        </>
    );
}

export default Dashboard;
