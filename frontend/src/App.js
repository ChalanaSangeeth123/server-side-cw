import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Search from './components/Search';
import Home from './components/Home';
import CreatePost from './components/CreatePost';
import './App.css';

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [user, setUser] = useState(null);

    const checkSession = async () => {
        try {
            const response = await axios.get('http://localhost:5000/check-session', { withCredentials: true });
            if (response.data.success) {
                setLoggedIn(true);
                setUser(response.data.user);
            } else {
                setLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            setLoggedIn(false);
            setUser(null);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            setLoggedIn(false);
            setUser(null);
            setApiKey('');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Router>
            <div className="app">
                <div className="header">
                    <h2>TravelTales</h2>
                </div>
                <nav>
                    <Link to="/">Home</Link> | 
                    <Link to="/search">Search</Link> | 
                    {loggedIn ? (
                        <>
                            <Link to="/feed">Feed</Link> | 
                            <Link to="/profile">Profile</Link> | 
                            <Link to="/create-post">Create Post</Link> | 
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link> | 
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
                <Routes>
                    <Route path="/" element={<Home apiKey={apiKey} setApiKey={setApiKey} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setUser={setUser} checkSession={checkSession} />} />
                    <Route path="/feed" element={loggedIn ? <Feed user={user} setLoggedIn={setLoggedIn} apiKey={apiKey} /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={loggedIn ? <Profile user={user} /> : <Navigate to="/login" />} />
                    <Route path="/search" element={loggedIn ? <Search /> : <Navigate to="/login" />} />
                    <Route path="/create-post" element={loggedIn ? <CreatePost apiKey={apiKey} setApiKey={setApiKey} onPostCreated={() => window.location.reload()} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;