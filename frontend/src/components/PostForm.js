import React, { useState } from 'react';
import axios from 'axios';

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
                <label>Title:</label>
                <input type="text" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} required />
                <label>Content:</label>
                <textarea value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} required />
                <label>Country:</label>
                <input type="text" value={post.country} onChange={(e) => setPost({ ...post, country: e.target.value })} required />
                <label>Date:</label>
                <input type="date" value={post.date} onChange={(e) => setPost({ ...post, date: e.target.value })} required />
                <button type="submit">{post.id ? 'Update' : 'Create'}</button>
                {post.id && <button type="button" onClick={handleDelete}>Delete</button>}
            </form>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
  };

  export default PostForm;