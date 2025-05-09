import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/followers', { withCredentials: true })
            .then(response => setFollowers(response.data.data))
            .catch(error => console.error('Error fetching followers:', error));
        axios.get('http://localhost:5000/api/following', { withCredentials: true })
            .then(response => setFollowing(response.data.data))
            .catch(error => console.error('Error fetching following:', error));
    }, []);

    const handleFollow = async (userId) => {
        await axios.post('/api/follow', { followingId: userId }, { withCredentials: true });
        axios.get('http://localhost:5000/api/following', { withCredentials: true })
            .then(response => setFollowing(response.data.data));
    };

    return (
        <div className="section">
            <h3>Profile</h3>
            <h4>{user.fn} {user.sn}</h4>
            <div>
                <h5>Followers</h5>
                {followers.map(follower => <p key={follower.id}>{follower.fn}</p>)}
            </div>
            <div>
                <h5>Following</h5>
                {following.map(follow => (
                    <p key={follow.id}>
                        {follow.fn} <button onClick={() => handleFollow(follow.id)}>Unfollow</button>
                    </p>
                ))}
            </div>
            {/* Add a follow button for new users if needed (requires a user list API) */}
        </div>
    );
};

export default Profile;