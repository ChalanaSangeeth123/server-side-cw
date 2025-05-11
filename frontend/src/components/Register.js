import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '', fn: '', sn: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/registerUser', formData, { withCredentials: true });
            if (response.data.success) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                setMessage(response.data.error || 'Registration failed.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="section">
            <h3>Register for TravelTales</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                />
                <label htmlFor="fn">First Name:</label>
                <input
                    type="text"
                    id="fn"
                    name="fn"
                    value={formData.fn}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                />
                <label htmlFor="sn">Last Name:</label>
                <input
                    type="text"
                    id="sn"
                    name="sn"
                    value={formData.sn}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <div className={message.includes('Error') || message.includes('failed') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default Register;