import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from '../App'
import NotSignedIn from '../components/notSignedIn';

function AddItem() {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { user, loggedIn } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('low');
    const [dueTime, setDueTime] = useState('');
    const [utcTime, setUtcTime] = useState('');
    const [hoursNeeded, setHoursNeeded] = useState('');
    const [eventLength, setEventLength] = useState('');
    console.log(hoursNeeded);
    
    function handleHoursNeeded(value) {
        const regex = /^\d*\.?\d*$/;
        
        if (regex.test(value)) {
            setHoursNeeded(value);
        } else {
            return;
        }
    
    }
    function handleEventLength(value){
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
    
        setDueTime(time)
        let arr = utcTimeString.split(' ');
        let utcTime = arr[4];
        let times = utcTime.split(":");
        let hour = times[0];
        let minute = times[1];
        utcTime = hour + ":" + minute;
        console.log(utcTime)
        setUtcTime(utcTime);
        setDueTime(time);
    }

    const handleDateChange = (day) => {
        setDueDate(day)
        console.log(dueDate);
    }

    const handlePriorityChange = (e) => {
        setPriority(e.target.value);
    };

    function convertToNumber(value) {
        value = value.trim();
        const number = parseFloat(value);
        return isFinite(number) ? number : NaN;
    }
    

    const handleSubmit = async () => {
        if (!title || !dueTime || !dueDate || !hoursNeeded) {
            setError(true);
            setErrorMessage("All fields must be filled");
            return;
        } else if (isNaN(parseFloat(hoursNeeded)) || !isFinite(hoursNeeded)) {
            setError(true);
            setErrorMessage("Hours Required Must be a Number");
            return;
        }

        setHoursNeeded(convertToNumber(hoursNeeded));

        try {
            const response = await fetch("http://localhost:3000/item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: user,
                    title: title,
                    dueTime: utcTime,
                    priority: priority,
                    dueDate: dueDate,
                    hours: hoursNeeded,
                    eventLength: eventLength
                }),
                credentials: 'include'
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setError(true);
                    setErrorMessage(data.error || 'Unexpected error occurred');
                } else {
                    const text = await response.text();
                    setError(true);
                    setErrorMessage(text || 'Unexpected error occurred');
                }
            }
        } catch (error) {
            setError(true);
            setErrorMessage(`Unexpected Error: ${error.message}`);
            console.error(error);
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
                                    onChange={(e) => handleDateChange(e.target.value)}
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
        )
    );
}

export default AddItem;