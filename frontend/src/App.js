import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import APIKey from './components/APIKey';
import CountryData from './components/CountryData';
import './App.css';

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [apiKey, setApiKey] = useState('');

    return (
        <Router>
            <div className="app">
                <h2>Country API Web Interface</h2>
                <nav>
                    <Link to="/">Register</Link> | <Link to="/login">Login</Link> | 
                    {loggedIn && <Link to="/apikey">Generate API Key</Link>} | 
                    {loggedIn && <Link to="/country">Get Country Data</Link>}
                </nav>
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
                    <Route path="/apikey" element={<APIKey setApiKey={setApiKey} />} />
                    <Route path="/country" element={<CountryData apiKey={apiKey} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;