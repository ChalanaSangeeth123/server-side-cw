import React, { useState } from 'react';
import axios from 'axios';

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
        <div className="max-w-3xl mx-auto p-6 bg-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Create a New Post</h3>
            {message && <div className={message.includes('Error') ? 'text-red-500' : 'text-green-500'}>{message}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Post Title"
                    className="border p-2 rounded"
                    required
                />
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Post Content"
                    className="border p-2 rounded"
                    rows="4"
                    required
                />
                <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="date"
                    name="dateOfVisit"
                    value={formData.dateOfVisit}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                >
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;