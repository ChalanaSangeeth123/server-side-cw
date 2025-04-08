import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setLoggedIn }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', formData, { withCredentials: true });
            if (response.data.success) {
                setLoggedIn(true);
                setMessage('Login successful! You can now generate an API key.');
            } else {
                setMessage(response.data.error || 'Login failed.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="section">
            <h3>Login</h3>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Password:</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default Login;