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
    const [uuid, setUuid] = useState(query.get('uuid') || "");
    const [title, setTitle] = useState(query.get("title") || "");
    const originalTitle = query.get("title") || "";
    const [timeStr, setTimeStr] = useState(query.get("timeStr") || "");
    const [utcTime, setUtcTime] = useState('');
    const [dayStr, setDayStr] = useState(query.get("dayStr") || "");
    const [completed, setCompleted] = useState(query.get("completed") === 'true');
    const [priority, setPriority] = useState(query.get("priority") || "low");
    const [hoursNeeded, setHoursNeeded] = useState(query.get("hours") || 0);
    const [eventLength, setEventLength] = useState(query.get("length") || 0);
    function handleHoursNeeded(value) {
        const regex = /^\d*\.?\d*$/;
        
        if (regex.test(value)) {
            setHoursNeeded(value);
        } else {
            return;
        }
    
    }
    function handleEventLength(value) { 
        const regex = /^\d*\.?\d*$/;
        if (regex.test(value)) {
            setEventLength(value);
        } else {
            return;
        }
    }
    const initialTimeChange = (event) => {
        if (!event || !event.target) {
            console.error("Event or event.target is undefined:", event);
            return;
        }

        console.log("Full event object:", event);

        const { value } = event.target;
        console.log("Value before passing to handleTimeChange:", value);


        handleTimeChange(value);
    }
    
    const handleTimeChange = (time) => {
        console.log("Received Time From handleTimeChange:", time);
    
        if (!time || typeof time !== 'string' || time.trim() === '') {
            console.error("Invalid time format or time is undefined:", time);
            return;
        }

        let [hours, minutes] = time.split(":");
    
        let d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);

        let utcTimeString = d.toUTCString();
    
        console.log("Original Time:", time);
        console.log("UTC Time:", utcTimeString);
    
        setTimeStr(time)
        let arr = utcTimeString.split(' ');
        let utcTime = arr[4];
        let times = utcTime.split(":");
        let hour = times[0];
        let minute = times[1];
        utcTime = hour + ":" + minute;
        console.log(utcTime)
        setUtcTime(utcTime);
        setTimeStr(time);
    }

    const handleDateChange = (e) => {
        setDayStr(e.target.value)
    }

    function handlePriorityChange (e) {
        setPriority(e.target.value);
    };

    const handleSubmit = async () => {
        if (isNaN(parseFloat(hoursNeeded)) || !isFinite(hoursNeeded)) {
            setError(true);
            setErrorMessage("Hours Required Must be a Number");
            return;
        }
        try{
            const response = await fetch('http://localhost:3000/item', {
                method: "PUT",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    user: user,
                    uuid: uuid,
                    newTitle: title, 
                    priority: priority, 
                    dueDate: dayStr, 
                    dueTime: timeStr, 
                    completed: completed,
                    hours: hoursNeeded,
                    eventLength: eventLength
                })
            });
            if(response.ok){
                console.log(response.status);
                navigate('/dashboard');
            } else {
                console.log("Weird error");
            }
        } catch (e) {
            setError(true);
            setErrorMessage(e);
        }
    }

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
    }, [timeStr, user, title, dayStr, completed, priority]);

    function handleDashboard() {
        navigate("/dashboard");
    }

    return loggedIn ? (
        <div className="signin">
            <div className="editCard">
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
                                <select value={priority} onChange={(e)=>{handlePriorityChange(e)}}>
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
                                onChange={(e) => handleDateChange(e)}
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
                                onChange={(e) => initialTimeChange(e)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="time-container">
                            <h3 className="time-container-item">Hours required before due date</h3>
                            <input
                                type="text"
                                className="number-of-hours"
                                id="hours"
                                value={hoursNeeded}
                                onChange={(e) => handleHoursNeeded(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="time-container">
                            <h3 className="time-container-item">Event Length</h3>
                            <input
                                type="text"
                                className="number-of-hours"
                                id="hours"
                                value={eventLength}
                                onChange={(e) => handleEventLength(e.target.value)}
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
