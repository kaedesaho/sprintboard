import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DemoLoginButton.css";

const DemoLoginButton = ({ className = "" }: { className?: string }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleClick = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:5000/api/users/demo-login', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.success) {
                login(data.username, data.id, data.photo_url ?? null);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Demo is unavailable right now.');
            }
        } catch {
            setError('Demo is unavailable right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`demo-login ${className}`}>
            <button
                type="button"
                className="demo-login-btn"
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? 'Opening demo…' : 'Try the demo'}
            </button>
            {error && <p className="demo-login-error">{error}</p>}
        </div>
    );
};

export default DemoLoginButton;
