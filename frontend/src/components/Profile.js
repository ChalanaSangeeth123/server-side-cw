import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; 

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
        <div className="container">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profile</h3>
            <h4 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{user.fn} {user.sn}</h4>
            <div className="profile-section">
                <h5>Followers</h5>
                {followers.length === 0 ? (
                    <p>No followers yet.</p>
                ) : (
                    followers.map(follower => (
                        <p key={follower.id}>{follower.fn} {follower.sn}</p>
                    ))
                )}
            </div>
            <div className="profile-section">
                <h5>Following</h5>
                {following.length === 0 ? (
                    <p>Not following anyone yet.</p>
                ) : (
                    following.map(follow => (
                        <p key={follow.id}>
                            {follow.fn} {follow.sn}{' '}
                            <button
                                onClick={() => handleUnfollow(follow.id)}
                                className="follow-btn bg-red-500 text-white hover:bg-red-600"
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