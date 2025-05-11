import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const Feed = ({ user, setLoggedIn }) => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    const fetchFeed = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/feed', { withCredentials: true });
            const postsWithLikes = await Promise.all(
                response.data.data.map(async post => {
                    const likeResponse = await axios.get(`http://localhost:5000/api/likes/likes?postId=${post.id}`, { withCredentials: true });
                    const followResponse = await axios.get(`http://localhost:5000/api/is-following/${post.user_id}`, { withCredentials: true });
                    return {
                        ...post,
                        likes: likeResponse.data.data?.likes || 0,
                        dislikes: likeResponse.data.data?.dislikes || 0,
                        isFollowing: followResponse.data.isFollowing
                    };
                })
            );
            setPosts(postsWithLikes);
            setError('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Session expired. Please log in again.');
                setLoggedIn(false);
            } else {
                setError('Error fetching feed: ' + error.message);
            }
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleLike = async (postId, type) => {
        try {
            await axios.post('http://localhost:5000/api/likes/like', { postId, type }, { withCredentials: true });
            await fetchFeed();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Session expired. Please log in again.');
                setLoggedIn(false);
            } else {
                setError('Error liking post: ' + error.message);
            }
        }
    };

    const handleFollowToggle = async (userId, isFollowing) => {
        try {
            if (isFollowing) {
                await axios.delete(`http://localhost:5000/api/follow/${userId}`, { withCredentials: true });
            } else {
                await axios.post('http://localhost:5000/api/follow', { followingId: userId }, { withCredentials: true });
            }
            await fetchFeed();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Session expired. Please log in again.');
                setLoggedIn(false);
            } else {
                setError('Error updating follow status: ' + error.message);
            }
        }
    };

    return (
        <div className="container">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Feed</h3>
            {error && <div className="error">{error}</div>}
            <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        <h4>
                            {post.title} by {(post.fn && post.sn) ? `${post.fn} ${post.sn}` : 'Anonymous'}
                        </h4>
                        <p>{post.content}</p>
                        <div className="metadata">
                            <p className="country">Country: {post.country}</p>
                            <p className="date">Date of Visit: {post.date_of_visit || 'N/A'}</p>
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
                            <button
                                onClick={() => handleFollowToggle(post.user_id, post.isFollowing)}
                                className={`follow-btn ${post.isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                            >
                                {post.isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;