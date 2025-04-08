import React, { useState } from 'react';
import axios from 'axios';

const APIKey = ({ setApiKey }) => {
    const [message, setMessage] = useState('');

    const handleGenerate = async () => {
        try {
            const response = await axios.post('http://localhost:5000/getapikey', {}, { withCredentials: true });
            if (response.data.success) {
                setApiKey(response.data.data);
                setMessage(`API Key generated: ${response.data.data}`);
            } else {
                setMessage(response.data.error || 'Failed to generate API key.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="section">
            <h3>Generate API Key</h3>
            <button onClick={handleGenerate}>Generate API Key</button>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        </div>
    );
};

export default APIKey;