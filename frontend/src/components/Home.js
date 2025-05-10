import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [following, setFollowing] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: '', content: '', country: '', dateOfVisit: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('http://localhost:5000/check-session', { withCredentials: true });
                if (response.data.success) {
                    setLoggedIn(true);
                    setUser(response.data.user);
                }
            } catch (error) {
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
                                    `http://localhost:5000/api/likes/likes?postId=${post.id}`,
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
                                console.error('Error fetching likes or follow status for post:', post.id, likeError);
                                return { ...post, likes: 0, dislikes: 0, isFollowing: false };
                            }
                        })
                    );
                    setPosts(postsWithLikes);
                    setError('');
                    const followState = {};
                    postsWithLikes.forEach(post => {
                        followState[post.user_id] = post.isFollowing;
                    });
                    setFollowing(followState);
                } else {
                    setError(response.data.error || 'Failed to fetch posts.');
                }
            } catch (error) {
                setError('Error fetching posts: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };

        checkSession().then(fetchPosts);
    }, [loggedIn]);

    const handleFollow = async (userId) => {
        try {
            await axios.post('/api/follow', { followingId: userId }, { withCredentials: true });
            setFollowing(prev => ({ ...prev, [userId]: true }));
            setPosts(posts.map(post =>
                post.user_id === userId ? { ...post, isFollowing: true } : post
            ));
        } catch (error) {
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
            setError('Error unfollowing user: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleLike = async (postId, type) => {
        if (!loggedIn) {
            setError('Please log in to like or dislike posts.');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/likes/like', { postId, type }, { withCredentials: true });
            const response = await axios.get('http://localhost:5000/api/posts', { withCredentials: true });
            if (response.data.success) {
                const postsWithLikes = await Promise.all(
                    response.data.data.map(async post => {
                        try {
                            const likeResponse = await axios.get(
                                `http://localhost:5000/api/likes/likes?postId=${post.id}`,
                                { withCredentials: true }
                            );
                            const followResponse = await axios.get(
                                `http://localhost:5000/api/is-following/${post.user_id}`,
                                { withCredentials: true }
                            );
                            return {
                                ...post,
                                likes: likeResponse.data.data?.likes || 0,
                                dislikes: likeResponse.data.data?.dislikes || 0,
                                isFollowing: followResponse.data.isFollowing
                            };
                        } catch (likeError) {
                            console.error('Error fetching likes or follow status for post:', post.id, likeError);
                            return { ...post, likes: 0, dislikes: 0, isFollowing: false };
                        }
                    })
                );
                setPosts(postsWithLikes);
                setError('');
            }
        } catch (error) {
            setError('Error liking/disliking post: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEditStart = (post) => {
        setEditingPostId(post.id);
        setEditFormData({
            title: post.title,
            content: post.content,
            country: post.country,
            dateOfVisit: post.date_of_visit || ''
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (postId) => {
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
                setEditFormData({ title: '', content: '', country: '', dateOfVisit: '' });
                setError('');
            } else {
                setError(response.data.error || 'Failed to update post.');
            }
        } catch (error) {
            setError('Error updating post: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEditCancel = () => {
        setEditingPostId(null);
        setEditFormData({ title: '', content: '', country: '', dateOfVisit: '' });
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
            setError('Error deleting post: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Recent Posts</h3>
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                    <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto border border-gray-200 hover:shadow-xl transition-all duration-300"
                    >
                        {editingPostId === post.id ? (
                            <div className="flex flex-col space-y-4">
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
                                    type="text"
                                    name="country"
                                    value={editFormData.country}
                                    onChange={handleEditChange}
                                    placeholder="Country"
                                    className="border p-2 rounded"
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
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditSubmit(post.id)}
                                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
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
                                <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-1">{post.title}</h4>
                                <p className="text-gray-600 mb-2 line-clamp-3">{post.content}</p>
                                <div className="flex flex-col space-y-2">
                                    <p className="text-sm text-gray-500 font-medium">Country: {post.country}</p>
                                    <p className="text-sm text-gray-500 font-medium">Date of Visit: {post.date_of_visit || 'N/A'}</p>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Author: {(post.fn && post.sn) ? `${post.fn} ${post.sn}` : 'Anonymous'}
                                        {loggedIn && (
                                            <button
                                                onClick={() => post.isFollowing ? handleUnfollow(post.user_id) : handleFollow(post.user_id)}
                                                className={`ml-2 text-sm px-2 py-1 rounded ${post.isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                            >
                                                {post.isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                        )}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <span className="flex items-center text-sm text-gray-700">
                                                <span className="mr-1">👍</span> {post.likes}
                                            </span>
                                            <span className="flex items-center text-sm text-gray-700">
                                                <span className="mr-1">👎</span> {post.dislikes}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            {loggedIn && (
                                                <>
                                                    <button
                                                        onClick={() => handleLike(post.id, 'like')}
                                                        className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                                                    >
                                                        Like
                                                    </button>
                                                    <button
                                                        onClick={() => handleLike(post.id, 'dislike')}
                                                        className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded"
                                                    >
                                                        Dislike
                                                    </button>
                                                    {user && user.id === post.user_id && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditStart(post)}
                                                                className="text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
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