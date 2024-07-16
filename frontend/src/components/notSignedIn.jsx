import { useNavigate } from 'react-router-dom'

function NotSignedIn(){
    const navigate = useNavigate();

    return(
        <div className="signin">
            <div className="card">
                <div className="card-body">
                    <h1 className="card-title">You aren't logged in</h1>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Back home</button>
                </div>
            </div>
        </div>
    )
}

export default NotSignedIn;