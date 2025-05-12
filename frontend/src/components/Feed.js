import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const Feed = ({ user, setLoggedIn, apiKey }) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState({});

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/feed', { withCredentials: true });
                if (response.data.success) {
                    const postsWithLikes = await Promise.all(
                        response.data.data.map(async post => {
                            try {
                                const likeResponse = await axios.get(
                                    `http://localhost:5000/api/likes?postId=${post.id}`,
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
                                console.error(`Error fetching likes/follow for post ${post.id}:`, likeError);
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
                    setError(response.data.error || 'Failed to fetch feed.');
                }
            } catch (error) {
                console.error('Error fetching feed:', error);
                setError('Error fetching feed: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

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
        try {
            console.log(`Sending ${type} request for post ${postId}`); // Debug
            const response = await axios.post(
                'http://localhost:5000/api/likes/like',
                { postId, type },
                { withCredentials: true }
            );
            console.log(`Like response for post ${postId}:`, response.data); // Debug
            if (response.data.success) {
                const likeResponse = await axios.get(
                    `http://localhost:5000/api/likes?postId=${postId}`,
                    { withCredentials: true }
                );
                console.log(`Get likes response for post ${postId}:`, likeResponse.data); // Debug
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

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-2xl font-semibold mb-6">Your Feed</h3>
            {loading && <div className="loading text-center">Loading...</div>}
            {error && <div className="error text-red-500 mb-4 text-center">{error}</div>}
            <div className="grid grid-cols-1 gap-6">
                {posts.length === 0 && !loading && (
                    <p className="text-center">No posts from users you follow.</p>
                )}
                {posts.map(post => (
                    <div key={post.id} className="post-card">
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
                                <button
                                    onClick={() => (post.isFollowing ? handleUnfollow(post.user_id) : handleFollow(post.user_id))}
                                    className={`follow-btn ml-2 ${post.isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-2 py-1 rounded text-sm`}
                                >
                                    {post.isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            </p>
                        </div>
                        <div className="like-dislike-display">
                            <span className="like">👍 {post.likes}</span>
                            <span className="dislike">👎 {post.dislikes}</span>
                        </div>
                        <div className="action-buttons">
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;