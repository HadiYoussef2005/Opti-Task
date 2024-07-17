import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from '../App';
import NotSignedIn from '../components/notSignedIn';

function AddItem(){
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { user, loggedIn, setUser, setLoggedIn } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('low');
    const [dueTime, setDueTime] = useState('');
    
    const handlePriorityChange = (e) => {
        setPriority(e.target.value);
    };
    
    const handleSubmit = async () => {
        if (!title || !dueTime || !dueDate) {
            setError(true);
            setErrorMessage("All fields must be filled");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3000/item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: user,
                    title: title,
                    dueTime: dueTime,
                    priority: priority,
                    dueDate: dueDate,
                }),
                credentials: 'include'
            });
    
            if (response.ok) {
                navigate('/dashboard');
            } else {
                setError(true);
                setErrorMessage(`Failed with status ${response.status}`);
            }
        } catch (e) {
            setError(true);
            setErrorMessage(`Unexpected Error: ${e.message}`);
            console.error(e);
        }
    };
    

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    return (
        loggedIn ? (
            <div className="signin">
                <div className="card">
                    <div className="card-body">
                        <h1 className="card-title">Enter your item details</h1>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="priority-choice">
                                <h3 className="priority-choice-item">Select Priority</h3>
                                <div className="priority-choice-item">
                                    <select value={priority} onChange={handlePriorityChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="date-container">
                                <h3 className="date-container-item">Due Date</h3>
                                <input 
                                    type="date"
                                    className="date-container-item"
                                    id="dueDate"
                                    placeholder="yyyy-mm-dd"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="form-group">
                            <div className="time-container">
                                <h3 className="time-container-item">Due Time</h3>
                                <input 
                                    type="time"
                                    className="time-container-item"
                                    id="dueTime"
                                    value={dueTime}
                                    onChange={(e) => setDueTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="buttons">
                            <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                            <button className="btn btn-primary" onClick={handleDashboard}>Dashboard</button>
                        </div>
                        
                    </div>
                    {error ? (<h3 className="error-message">{errorMessage}</h3>):null}
                </div>
            </div>
        ) : (
            <NotSignedIn />
        )
    );
}

export default AddItem;
