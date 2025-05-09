import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setLoggedIn, setUser, checkSession }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', formData, { withCredentials: true });
            if (response.data.success) {
                setLoggedIn(true);
                setUser({ id: response.data.data.user.id, fn: response.data.data.user.fn, sn: response.data.data.user.sn });
                setMessage('Login successful! Redirecting to feed...');
                if (checkSession) {
                    await checkSession(); // Re-check session to update App.js state
                }
                navigate('/feed');
            } else {
                setMessage(response.data.error || 'Login failed.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('Session invalid. Please log in again.');
            } else {
                setMessage('Error: ' + error.message);
            }
        }
    };

    return (
        <div className="section">
            <h3>Login to TravelTales</h3>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <div className={message.includes('Error') || message.includes('failed') || message.includes('invalid') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default Login;