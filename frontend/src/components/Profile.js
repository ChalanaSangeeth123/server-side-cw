import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/followers', { withCredentials: true })
            .then(response => setFollowers(response.data.data || []))
            .catch(error => console.error('Error fetching followers:', error));
        axios.get('http://localhost:5000/api/following', { withCredentials: true })
            .then(response => setFollowing(response.data.data || []))
            .catch(error => console.error('Error fetching following:', error));
    }, []);

    const handleFollow = async (userId) => {
        try {
            await axios.post('/api/follow', { followingId: userId }, { withCredentials: true });
            const response = await axios.get('http://localhost:5000/api/following', { withCredentials: true });
            setFollowing(response.data.data || []);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await axios.delete(`/api/follow/${userId}`, { withCredentials: true });
            const response = await axios.get('http://localhost:5000/api/following', { withCredentials: true });
            setFollowing(response.data.data || []);
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profile</h3>
            <h4 className="text-2xl font-semibold text-gray-900 mb-6">{user.fn} {user.sn}</h4>
            <div className="mb-8">
                <h5 className="text-xl font-medium text-gray-700 mb-4">Followers</h5>
                {followers.length === 0 ? (
                    <p className="text-gray-500">No followers yet.</p>
                ) : (
                    followers.map(follower => (
                        <p key={follower.id} className="text-gray-600 mb-2">{follower.fn} {follower.sn}</p>
                    ))
                )}
            </div>
            <div>
                <h5 className="text-xl font-medium text-gray-700 mb-4">Following</h5>
                {following.length === 0 ? (
                    <p className="text-gray-500">Not following anyone yet.</p>
                ) : (
                    following.map(follow => (
                        <p key={follow.id} className="text-gray-600 mb-2">
                            {follow.fn} {follow.sn}{' '}
                            <button
                                onClick={() => handleUnfollow(follow.id)}
                                className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                                Unfollow
                            </button>
                        </p>
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;