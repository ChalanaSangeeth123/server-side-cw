import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const Search = () => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('country');
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setResults([]);

        try {
            const response = await axios.get('http://localhost:5000/api/posts/search', {
                params: { q: query, type },
                withCredentials: true
            });
            if (response.data.success) {
                setResults(response.data.data || []);
            } else {
                setMessage(response.data.error || 'No results found.');
            }
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Search</h3>
            {loading && <div className="loading">Loading...</div>}
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            value="country"
                            checked={type === 'country'}
                            onChange={(e) => setType(e.target.value)}
                        />
                        Search by Country
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="username"
                            checked={type === 'username'}
                            onChange={(e) => setType(e.target.value)}
                        />
                        Search by Username
                    </label>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Enter ${type === 'country' ? 'country' : 'username'}`}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {results.length === 0 && !message && !loading && (
                <p className="text-gray-600 text-center">No results found.</p>
            )}
            <div className="grid grid-cols-1 gap-6">
                {results.map(post => (
                    <div key={post.id} className="post-card">
                        <h4>{post.title}</h4>
                        <p>{post.content}</p>
                        <div className="metadata">
                            <p>Author: {(post.fn && post.sn) ? `${post.fn} ${post.sn}` : 'Anonymous'}</p>
                            <p className="country">Country: {post.country}</p>
                            <p className="date">Date of Visit: {post.date_of_visit || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;