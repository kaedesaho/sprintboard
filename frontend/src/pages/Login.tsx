import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Auth.css";

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');

        try {
            const res = await fetch('http://127.0.0.1:5000/api/users/login', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({identifier, password})
            })

            const data = await res.json()

            if (data.success) {
                login(data.username, data.id, data.photo_url ?? null);
                navigate('/Dashboard');
            } else {
                setError('Username/Email or password is incorrect. \nPlease try again.');
            } 
        } catch (error) {
            setError('Login failed. Please try again.');
        }
    };

    return (
    <div className="auth">
        <div className="auth-container">
            <h1>Log in</h1>
            {error && <p className="error">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="identifier">Username/Email</label>
                <input 
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                />
                <label htmlFor="password">Password*</label>
                <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <button type="submit">Log in</button>
                <Link to="/signup" className="auth-link">Don't have an account?</Link>
            </form>
        </div>
    </div>
    );
};

export default Login;