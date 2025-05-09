import React, { useState } from 'react';
import axios from 'axios';

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
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Search</h3>
            {loading && <div className="text-center">Loading...</div>}
            {message && <div className={message.includes('Error') ? 'text-red-500' : 'text-gray-600'}>{message}</div>}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="country"
                                checked={type === 'country'}
                                onChange={(e) => setType(e.target.value)}
                                className="mr-2"
                            />
                            Search by Country
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="username"
                                checked={type === 'username'}
                                onChange={(e) => setType(e.target.value)}
                                className="mr-2"
                            />
                            Search by Username
                        </label>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Enter ${type === 'country' ? 'country' : 'username'}`}
                        className="border p-2 rounded w-full"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>
            {results.length === 0 && !message && !loading && (
                <p className="text-gray-600 text-center">No results found.</p>
            )}
            <div className="grid grid-cols-1 gap-6">
                {results.map(post => (
                    <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto border border-gray-200 hover:shadow-xl transition-all duration-300"
                    >
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h4>
                        <p className="text-gray-600 mb-2">{post.content}</p>
                        <p className="text-gray-500">Author: {post.username || 'Unknown'}</p>
                        <p className="text-gray-500">Country: {post.country}</p>
                        <p className="text-gray-500">Date of Visit: {post.date_of_visit || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;