import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const PostForm = ({ post: initialPost, onSave }) => {
    const [post, setPost] = useState(initialPost || { title: '', content: '', country: '', date: new Date().toISOString().split('T')[0] });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = post.id ? `/api/posts/${post.id}` : '/api/posts';
            const method = post.id ? 'put' : 'post';
            await axios[method](endpoint, post, { withCredentials: true });
            setMessage('Post saved successfully!');
            if (onSave) onSave();
        } catch (error) {
            setMessage('Error saving post: ' + error.message);
        }
    };

    const handleDelete = async () => {
        if (post.id) {
            if (window.confirm('Are you sure you want to delete this post?')) {
                try {
                    await axios.delete(`/api/posts/${post.id}`, { withCredentials: true });
                    setMessage('Post deleted successfully!');
                    if (onSave) onSave();
                } catch (error) {
                    setMessage('Error deleting post: ' + error.message);
                }
            }
        }
    };

    return (
        <div className="section">
            <h3>{post.id ? 'Edit Post' : 'Create Post'}</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={post.title}
                    onChange={(e) => setPost({ ...post, title: e.target.value })}
                    required
                />
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    value={post.content}
                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                    required
                />
                <label htmlFor="country">Country:</label>
                <input
                    type="text"
                    id="country"
                    value={post.country}
                    onChange={(e) => setPost({ ...post, country: e.target.value })}
                    required
                />
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={post.date}
                    onChange={(e) => setPost({ ...post, date: e.target.value })}
                    required
                />
                <div className="action-buttons">
                    <button type="submit">{post.id ? 'Update' : 'Create'}</button>
                    {post.id && (
                        <button type="button" onClick={handleDelete} className="delete-btn">
                            Delete
                        </button>
                    )}
                </div>
            </form>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default PostForm;