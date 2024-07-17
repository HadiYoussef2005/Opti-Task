import { useNavigate } from "react-router-dom"

function NotExist(){
    const navigate = useNavigate();
    const handleBackHome = () => {
        navigate('/');
    }
    return(
        <div className="signin">
            <div className="card">
                <div className="card-body">
                    <h1 className="title">You tried to access a page that doesnt exist</h1>
                    <div className="buttons">
                        <button className = "btn btn-primary" onClick={handleBackHome}>Back Home</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotExist;