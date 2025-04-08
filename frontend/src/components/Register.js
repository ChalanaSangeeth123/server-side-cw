import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '', fn: '', sn: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/registerUser', formData);
            setMessage(response.data.success ? 'Registration successful! Please log in.' : response.data.error);
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="section">
            <h3>Register</h3>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Password:</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                <label>First Name:</label>
                <input type="text" name="fn" value={formData.fn} onChange={handleChange} required />
                <label>Last Name:</label>
                <input type="text" name="sn" value={formData.sn} onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default Register;