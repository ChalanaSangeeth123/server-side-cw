import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CountryData = ({ apiKey }) => {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [countryData, setCountryData] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setMessage('');
        axios.get('https://restcountries.com/v3.1/all', { headers: { 'X-API-Key': apiKey } })
            .then(response => {
                const countryList = response.data.map(country => ({
                    name: country.name.common
                }));
                setCountries(countryList);
                setLoading(false);
            })
            .catch(error => {
                setMessage('Error fetching country list: ' + (error.response?.data?.error || error.message));
                setLoading(false);
            });
    }, [apiKey]);

    const handleChange = async (e) => {
        const countryName = e.target.value;
        setSelectedCountry(countryName);
        setLoading(true);
        setMessage('');
        setCountryData(null);

        if (countryName) {
            try {
                const response = await axios.get(`http://localhost:5000/api/countries/${countryName}`, {
                    headers: { 'X-API-Key': apiKey }
                });
                if (response.data.success) {
                    setCountryData(response.data.data);
                    setMessage('Country data retrieved successfully!');
                } else {
                    setMessage(response.data.error || 'Failed to retrieve country data.');
                }
            } catch (error) {
                setMessage('Error: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Country Data</h3>
            {loading && <div className="text-center">Loading...</div>}
            {message && <div className={message.includes('Error') ? 'text-red-500' : 'text-green-500'}>{message}</div>}
            {!loading && (
                <>
                    <select
                        onChange={handleChange}
                        value={selectedCountry}
                        className="border p-2 rounded w-full mb-4"
                        disabled={countries.length === 0}
                    >
                        <option value="">Select a Country</option>
                        {countries.map(country => (
                            <option key={country.name} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                    {countryData && (
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h4 className="text-xl font-semibold text-gray-900 mb-3">{countryData.name}</h4>
                            <p><strong>Capital:</strong> {countryData.capital || 'N/A'}</p>
                            <p><strong>Currency:</strong> {countryData.currencies?.map(c => `${c.name} (${c.code})`).join(', ') || 'N/A'}</p>
                            <p><strong>Languages:</strong> {countryData.languages?.join(', ') || 'N/A'}</p>
                            <p><strong>Flag:</strong> {countryData.flag && <img src={countryData.flag} alt={`${countryData.name} flag`} width="100" />}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CountryData;