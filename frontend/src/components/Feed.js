import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Feed</h3>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                    <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto border border-gray-200 hover:shadow-xl transition-all duration-300"
                    >
                        <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-1">
                            {post.title} by {(post.fn && post.sn) ? `${post.fn} ${post.sn}` : 'Anonymous'}
                        </h4>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                        <div className="flex flex-col space-y-2">
                            <p className="text-sm text-gray-500 font-medium">Country: {post.country}</p>
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
                                    <button
                                        onClick={() => handleLike(post.id, 'like')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Like
                                    </button>
                                    <button
                                        onClick={() => handleLike(post.id, 'dislike')}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Dislike
                                    </button>
                                    <button
                                        onClick={() => handleFollowToggle(post.user_id, post.isFollowing)}
                                        className={`text-sm px-2 py-1 rounded ${post.isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                    >
                                        {post.isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;