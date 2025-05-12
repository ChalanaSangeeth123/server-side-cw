import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const Home = ({ apiKey, setApiKey }) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [following, setFollowing] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        content: '',
        country: '',
        dateOfVisit: '',
        capital: '',
        currency: '',
        languages: '',
        flag: ''
    });
    const [editCountryData, setEditCountryData] = useState(null);
    const [user, setUser] = useState(null);
    const [sortOption, setSortOption] = useState('newest');
    const [countries, setCountries] = useState([]);
    const [countryLoading, setCountryLoading] = useState(false);
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [apiKeyMessage, setApiKeyMessage] = useState('');

    useEffect(() => {
        if (!localApiKey) {
            setCountries([]);
            setCountryLoading(false);
            return;
        }

        setCountryLoading(true);
        axios
            .get('https://restcountries.com/v3.1/all', { headers: { 'X-API-Key': localApiKey } })
            .then(response => {
                const countryList = response.data
                    .map(country => ({
                        name: country.name.common
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                setCountries(countryList);
                setCountryLoading(false);
                setApiKeyMessage('API key validated successfully.');
                setApiKey(localApiKey); // Sync with parent
            })
            .catch(error => {
                console.error('Error fetching country list:', error);
                setError('Invalid API key. Please generate or enter a valid key.');
                setCountries([]);
                setCountryLoading(false);
            });
    }, [localApiKey, setApiKey]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('http://localhost:5000/check-session', { withCredentials: true });
                if (response.data.success) {
                    setLoggedIn(true);
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Session check error:', error);
                setLoggedIn(false);
                setUser(null);
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/posts', { withCredentials: true });
                if (response.data.success) {
                    const postsWithLikes = await Promise.all(
                        response.data.data.map(async post => {
                            try {
                                const likeResponse = await axios.get(
                                    `http://localhost:5000/api/likes?postId=${post.id}`,
                                    { withCredentials: true }
                                );
                                let isFollowing = false;
                                if (loggedIn) {
                                    const followResponse = await axios.get(
                                        `http://localhost:5000/api/is-following/${post.user_id}`,
                                        { withCredentials: true }
                                    );
                                    isFollowing = followResponse.data.isFollowing;
                                }
                                return {
                                    ...post,
                                    likes: likeResponse.data.data?.likes || 0,
                                    dislikes: likeResponse.data.data?.dislikes || 0,
                                    isFollowing
                                };
                            } catch (likeError) {
                                console.error(`Error fetching likes/follow for post ${post.id}:`, likeError);
                                return { ...post, likes: 0, dislikes: 0, isFollowing: false };
                            }
                        })
                    );
                    const sortedPosts = sortPosts(postsWithLikes, sortOption);
                    setPosts(sortedPosts);
                    setError('');
                    const followState = {};
                    sortedPosts.forEach(post => {
                        followState[post.user_id] = post.isFollowing;
                    });
                    setFollowing(followState);
                } else {
                    setError(response.data.error || 'Failed to fetch posts.');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Error fetching posts: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };

        checkSession().then(fetchPosts);
    }, [loggedIn, sortOption]);

    const sortPosts = (posts, option) => {
        const sorted = [...posts];
        if (option === 'newest') {
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (option === 'most-liked') {
            return sorted.sort((a, b) => b.likes - a.likes);
        } else if (option === 'most-commented') {
            console.warn('Sorting by most-commented is not supported yet.');
            return sorted;
        }
        return sorted;
    };

    const handleSortChange = (e) => {
        const newSortOption = e.target.value;
        setSortOption(newSortOption);
        setPosts(prevPosts => sortPosts(prevPosts, newSortOption));
    };

    const handleFollow = async (userId) => {
        try {
            await axios.post('/api/follow', { followingId: userId }, { withCredentials: true });
            setFollowing(prev => ({ ...prev, [userId]: true }));
            setPosts(posts.map(post =>
                post.user_id === userId ? { ...post, isFollowing: true } : post
            ));
        } catch (error) {
            console.error('Error following user:', error);
            setError('Error following user: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await axios.delete(`/api/follow/${userId}`, { withCredentials: true });
            setFollowing(prev => ({ ...prev, [userId]: false }));
            setPosts(posts.map(post =>
                post.user_id === userId ? { ...post, isFollowing: false } : post
            ));
        } catch (error) {
            console.error('Error unfollowing user:', error);
            setError('Error unfollowing user: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleLike = async (postId, type) => {
        if (!loggedIn) {
            setError('Please log in to like or dislike posts.');
            return;
        }
        try {
            console.log(`Sending ${type} request for post ${postId}`);
            const response = await axios.post(
                'http://localhost:5000/api/likes/like',
                { postId, type },
                { withCredentials: true }
            );
            console.log(`Like response for post ${postId}:`, response.data);
            if (response.data.success) {
                const likeResponse = await axios.get(
                    `http://localhost:5000/api/likes?postId=${postId}`,
                    { withCredentials: true }
                );
                console.log(`Get likes response for post ${postId}:`, likeResponse.data);
                if (likeResponse.data.success) {
                    setPosts(posts.map(post =>
                        post.id === postId
                            ? {
                                  ...post,
                                  likes: likeResponse.data.data?.likes || 0,
                                  dislikes: likeResponse.data.data?.dislikes || 0
                              }
                            : post
                    ));
                    setError('');
                } else {
                    setError(`Failed to fetch likes: ${likeResponse.data.error}`);
                }
            } else {
                setError(`Failed to ${type} post: ${response.data.error}`);
            }
        } catch (error) {
            console.error(`Error ${type}ing post ${postId}:`, error);
            setError(`Error ${type}ing post: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEditStart = (post) => {
        setEditingPostId(post.id);
        setEditFormData({
            title: post.title,
            content: post.content,
            country: post.country,
            dateOfVisit: post.date_of_visit || '',
            capital: post.capital || '',
            currency: post.currency || '',
            languages: post.languages || '',
            flag: post.flag || ''
        });
        setEditCountryData({
            name: post.country,
            capital: post.capital,
            currencies: post.currency ? [{ name: post.currency.split(' (')[0], code: post.currency.match(/\((\w+)\)/)?.[1] }] : [],
            languages: post.languages ? post.languages.split(', ') : [],
            flag: post.flag
        });
    };

    const handleGenerateApiKey = async () => {
        try {
            const response = await axios.post('http://localhost:5000/getapikey', {}, { withCredentials: true });
            if (response.data.success) {
                setLocalApiKey(response.data.data);
                setApiKey(response.data.data); // Sync with parent
                setApiKeyMessage(`API Key generated: ${response.data.data}`);
                setError('');
            } else {
                setApiKeyMessage(response.data.error || 'Failed to generate API key.');
            }
        } catch (error) {
            setApiKeyMessage('Error: ' + error.message);
        }
    };

    const handleEditChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'country' && value) {
            setCountryLoading(true);
            setEditCountryData(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/countries/${value}`, {
                    headers: { 'X-API-Key': localApiKey }
                });
                if (response.data.success) {
                    const { name, capital, currencies, languages, flag } = response.data.data;
                    setEditCountryData(response.data.data);
                    setEditFormData({
                        ...editFormData,
                        country: name,
                        capital: capital || '',
                        currency: currencies?.map(c => `${c.name} (${c.code})`).join(', ') || '',
                        languages: languages?.join(', ') || '',
                        flag: flag || ''
                    });
                } else {
                    setEditFormData({
                        ...editFormData,
                        country: value,
                        capital: '',
                        currency: '',
                        languages: '',
                        flag: ''
                    });
                }
            } catch (error) {
                console.error('Error fetching country data:', error);
                setError('Error fetching country data. Please check your API key.');
                setEditFormData({
                    ...editFormData,
                    country: value,
                    capital: '',
                    currency: '',
                    languages: '',
                    flag: ''
                });
            } finally {
                setCountryLoading(false);
            }
        } else if (name === 'apiKey') {
            setLocalApiKey(value);
            setApiKeyMessage('');
            setError('');
        } else {
            setEditFormData({ ...editFormData, [name]: value });
        }
    };

    const handleEditSubmit = async (postId) => {
        if (!localApiKey) {
            setError('Please generate or enter an API key.');
            return;
        }
        try {
            const response = await axios.put('http://localhost:5000/api/posts', {
                id: postId,
                ...editFormData
            }, { withCredentials: true });
            if (response.data.success) {
                setPosts(posts.map(post =>
                    post.id === postId ? { ...post, ...editFormData, date_of_visit: editFormData.dateOfVisit } : post
                ));
                setEditingPostId(null);
                setEditFormData({
                    title: '',
                    content: '',
                    country: '',
                    dateOfVisit: '',
                    capital: '',
                    currency: '',
                    languages: '',
                    flag: ''
                });
                setEditCountryData(null);
                setApiKeyMessage('');
                setError('');
            } else {
                setError(response.data.error || 'Failed to update post.');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            setError('Error updating post: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEditCancel = () => {
        setEditingPostId(null);
        setEditFormData({
            title: '',
            content: '',
            country: '',
            dateOfVisit: '',
            capital: '',
            currency: '',
            languages: '',
            flag: ''
        });
        setEditCountryData(null);
        setApiKeyMessage('');
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const response = await axios.delete('http://localhost:5000/api/posts', {
                data: { id: postId },
                withCredentials: true
            });
            if (response.data.success) {
                setPosts(posts.filter(post => post.id !== postId));
                setError('');
            } else {
                setError(response.data.error || 'Failed to delete post.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            setError('Error deleting post: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <div className="header-container flex justify-between items-center mb-6">
                <span className="header-text text-2xl font-semibold">Recent Posts</span>
                <div className="sort-container flex items-center">
                    <label htmlFor="sort" className="sort-label mr-2 text-gray-700">Sort by:</label>
                    <select
                        id="sort"
                        value={sortOption}
                        onChange={handleSortChange}
                        className="sort-select border p-2 rounded text-gray-900"
                    >
                        <option value="newest">Newest</option>
                        <option value="most-liked">Most Liked</option>
                        <option value="most-commented">Most Commented</option>
                    </select>
                </div>
            </div>
            {loading && <div className="loading text-center">Loading...</div>}
            {error && <div className="error text-red-500 mb-4 text-center">{error}</div>}
            {apiKeyMessage && editingPostId && (
                <div className={apiKeyMessage.includes('Error') || apiKeyMessage.includes('Failed') ? 'error' : 'success'}>{apiKeyMessage}</div>
            )}
            <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        {editingPostId === post.id ? (
                            <div className="edit-form flex flex-col space-y-4">
                                <div className="section">
                                    <h3>API Key</h3>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            name="apiKey"
                                            value={localApiKey}
                                            onChange={handleEditChange}
                                            placeholder="Enter or Generate API Key"
                                            className="border p-2 rounded flex-grow"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerateApiKey}
                                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                        >
                                            Generate API Key
                                        </button>
                                    </div>
                                </div>
                                {countryLoading ? (
                                    <div>Loading countries...</div>
                                ) : (
                                    <select
                                        name="country"
                                        value={editFormData.country}
                                        onChange={handleEditChange}
                                        className="border p-2 rounded"
                                        required
                                        disabled={!localApiKey || countries.length === 0}
                                    >
                                        <option value="">Select a Country</option>
                                        {countries.map(country => (
                                            <option key={country.name} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditChange}
                                    placeholder="Post Title"
                                    className="border p-2 rounded"
                                    required
                                />
                                <textarea
                                    name="content"
                                    value={editFormData.content}
                                    onChange={handleEditChange}
                                    placeholder="Post Content"
                                    className="border p-2 rounded"
                                    rows="4"
                                    required
                                />
                                <input
                                    type="date"
                                    name="dateOfVisit"
                                    value={editFormData.dateOfVisit}
                                    onChange={handleEditChange}
                                    className="border p-2 rounded"
                                    required
                                />
                                {editCountryData && (
                                    <div className="country-data-card mt-4">
                                        <h4>{editCountryData.name}</h4>
                                        <p><strong>Capital:</strong> {editCountryData.capital || 'N/A'}</p>
                                        <p><strong>Currency:</strong> {editCountryData.currencies?.map(c => `${c.name} (${c.code})`).join(', ') || 'N/A'}</p>
                                        <p><strong>Languages:</strong> {editCountryData.languages?.join(', ') || 'N/A'}</p>
                                        <p><strong>Flag:</strong> {editCountryData.flag && <img src={editCountryData.flag} alt={`${editCountryData.name} flag`} width="100" />}</p>
                                    </div>
                                )}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditSubmit(post.id)}
                                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                        disabled={countryLoading}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                                <div className="metadata">
                                    <p><strong>Country:</strong> {post.country}</p>
                                    <p><strong>Capital:</strong> {post.capital || 'N/A'}</p>
                                    <p><strong>Currency:</strong> {post.currency || 'N/A'}</p>
                                    <p><strong>Languages:</strong> {post.languages || 'N/A'}</p>
                                    <p><strong>Flag:</strong> {post.flag && <img src={post.flag} alt={`${post.country} flag`} width="100" />}</p>
                                    <p><strong>Date of Visit:</strong> {post.date_of_visit || 'N/A'}</p>
                                </div>
                                <div className="author">
                                    <p>
                                        Author: {(post.fn && post.sn) ? `${post.fn} ${post.sn}` : 'Anonymous'}
                                        {loggedIn && (
                                            <button
                                                onClick={() => (post.isFollowing ? handleUnfollow(post.user_id) : handleFollow(post.user_id))}
                                                className={`follow-btn ml-2 ${post.isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-2 py-1 rounded text-sm`}
                                            >
                                                {post.isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                        )}
                                    </p>
                                </div>
                                <div className="like-dislike-display">
                                    <span className="like">👍 {post.likes}</span>
                                    <span className="dislike">👎 {post.dislikes}</span>
                                </div>
                                <div className="action-buttons">
                                    {loggedIn && (
                                        <>
                                            <button
                                                onClick={() => handleLike(post.id, 'like')}
                                                className="like-btn"
                                            >
                                                Like
                                            </button>
                                            <button
                                                onClick={() => handleLike(post.id, 'dislike')}
                                                className="dislike-btn"
                                            >
                                                Dislike
                                            </button>
                                            {user && user.id === post.user_id && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditStart(post)}
                                                        className="edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;