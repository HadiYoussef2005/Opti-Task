import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../App';
import NotSignedIn from '../components/notSignedIn';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function EditTodo() {
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(UserContext);
    const query = useQuery();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [title, setTitle] = useState(query.get("title") || "");
    const [timeStr, setTimeStr] = useState(query.get("timeStr") || "");
    const [dayStr, setDayStr] = useState(query.get("dayStr") || "");
    const [completed, setCompleted] = useState(query.get("completed") === 'true');
    const [priority, setPriority] = useState(query.get("priority") || "low");

    useEffect(() => {
        if (timeStr.includes("PM") || timeStr.includes("AM")) {
            let [time, period] = timeStr.split(" ");
            let [hours, minutes] = time.split(":");
            hours = parseInt(hours);

            if (period === "PM" && hours < 12) {
                hours += 12;
            } else if (period === "AM" && hours === 12) {
                hours = 0;
            }

            setTimeStr(`${hours.toString().padStart(2, '0')}:${minutes}`);
        }

        console.log("User:", user);
        console.log("Title:", title);
        console.log("TimeStr:", timeStr);
        console.log("DayStr:", dayStr);
        console.log("Completed:", completed);
        console.log("Priority:", priority);
    }, [timeStr, user, title, dayStr, completed, priority]);

    function handleSubmit() {
        navigate("/dashboard");
    }

    function handleDashboard() {
        navigate("/dashboard");
    }

    return loggedIn ? (
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
                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
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
                                value={dayStr}
                                onChange={(e) => setDayStr(e.target.value)}
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
                                value={timeStr}
                                onChange={(e) => setTimeStr(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="buttons">
                        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                        <button className="btn btn-primary" onClick={handleDashboard}>Dashboard</button>
                    </div>
                </div>
                {error ? (<h3 className="error-message">{errorMessage}</h3>) : null}
            </div>
        </div>
    ) : (
        <NotSignedIn />
    );
}

export default EditTodo;
