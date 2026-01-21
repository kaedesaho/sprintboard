import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // const res = await fetch('http://localhost:5000/api/signup', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ username, email, password }),
            // });

            // const data = await res.json();

            const data = { success: true };

            if (data.success) {
                setSuccess('Account created successfully! \nRedirecting to login...');
                setTimeout(() => navigate('/login'), 4000);
            } else {
                setError('Signup failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };
            

    return (
    <div className="auth">
        <div className="auth-container">
            <h1>Create an Account</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username*</label>
                <input 
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
                <label htmlFor="email">Email*</label>
                <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
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
                <label htmlFor="confirm-password">Confirm Password*</label>
                <input 
                id="confirm-password"
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    </div>
    );
};

export default Signup;