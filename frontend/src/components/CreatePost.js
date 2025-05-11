import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const CreatePost = ({ onPostCreated }) => {
    const [formData, setFormData] = useState({ title: '', content: '', country: '', dateOfVisit: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/posts', formData, { withCredentials: true });
            if (response.data.success) {
                setMessage('Post created successfully!');
                setFormData({ title: '', content: '', country: '', dateOfVisit: '' });
                if (onPostCreated) onPostCreated();
            } else {
                setMessage(response.data.error || 'Failed to create post.');
            }
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h3>Create a New Post</h3>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Post Title"
                    required
                />
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Post Content"
                    rows="4"
                    required
                />
                <label htmlFor="country">Country:</label>
                <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    required
                />
                <label htmlFor="dateOfVisit">Date of Visit:</label>
                <input
                    type="date"
                    id="dateOfVisit"
                    name="dateOfVisit"
                    value={formData.dateOfVisit}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;