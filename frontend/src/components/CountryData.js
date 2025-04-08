import React, { useState } from 'react';
import axios from 'axios';

const CountryData = ({ apiKey }) => {
    const [country, setCountry] = useState('');
    const [countryData, setCountryData] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:5000/api/countries/${country}`, {
                headers: { 'X-API-Key': apiKey }
            });
            if (response.data.success) {
                setCountryData(response.data.data);
                setMessage('Country data retrieved successfully!');
            } else {
                setCountryData(null);
                setMessage(response.data.error || 'Failed to retrieve country data.');
            }
        } catch (error) {
            setCountryData(null);
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="section">
            <h3>Get Country Data</h3>
            <form onSubmit={handleSubmit}>
                <label>Country Name:</label>
                <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., France"
                    required
                />
                <label>API Key:</label>
                <input type="text" value={apiKey} readOnly />
                <button type="submit">Get Country Data</button>
            </form>
            {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
            {countryData && (
                <div className="country-data">
                    <h4>{countryData.name}</h4>
                    <p><strong>Capital:</strong> {countryData.capital}</p>
                    <p><strong>Currencies:</strong> {countryData.currencies.map(c => `${c.name} (${c.code})`).join(', ')}</p>
                    <p><strong>Languages:</strong> {countryData.languages.join(', ')}</p>
                    <p><strong>Flag:</strong> <img src={countryData.flag} alt={`${countryData.name} flag`} width="100" /></p>
                </div>
            )}
        </div>
    );
};

export default CountryData;