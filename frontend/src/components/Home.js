import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                                return {
                                    ...post,
                                    likes: likeResponse.data.data?.likes || 0,
                                    dislikes: likeResponse.data.data?.dislikes || 0
                                };
                            } catch (likeError) {
                                console.error('Error fetching likes for post:', post.id, likeError);
                                return { ...post, likes: 0, dislikes: 0 };
                            }
                        })
                    );
                    setPosts(postsWithLikes);
                    setError('');
                } else {
                    setError(response.data.error || 'Failed to fetch posts.');
                }
            } catch (error) {
                setError('Error fetching posts: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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
                        <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-1">{post.title}</h4>
                        <p className="text-gray-600 mb-2 line-clamp-3">{post.content}</p>
                        <div className="flex flex-col space-y-2">
                            <p className="text-sm text-gray-500 font-medium">Country: {post.country}</p>
                            <p className="text-sm text-gray-500 font-medium">Date of Visit: {post.date_of_visit || 'N/A'}</p>
                            <p className="text-sm text-gray-500 font-medium">Author: {post.username || 'Unknown'}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <span className="flex items-center text-sm text-gray-700">
                                        <span className="mr-1">👍</span> {post.likes}
                                    </span>
                                    <span className="flex items-center text-sm text-gray-700">
                                        <span className="mr-1">👎</span> {post.dislikes}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;