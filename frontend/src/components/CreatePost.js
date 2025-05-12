import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const CreatePost = ({ apiKey, setApiKey, onPostCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        country: '',
        dateOfVisit: '',
        capital: '',
        currency: '',
        languages: '',
        flag: ''
    });
    const [countryData, setCountryData] = useState(null);
    const [countries, setCountries] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countryLoading, setCountryLoading] = useState(false);
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [apiKeyMessage, setApiKeyMessage] = useState('');

    // Fetch countries when API key changes
    useEffect(() => {
        if (!localApiKey) {
            setCountries([]);
            setCountryData(null);
            return;
        }

        setCountryLoading(true);
        axios
            .get('https://restcountries.com/v3.1/all', { headers: { 'X-API-Key': localApiKey } })
            .then(response => {
                const countryList = response.data
                    .map(country => ({
                        name: country.name.common
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                setCountries(countryList);
                setCountryLoading(false);
                setApiKeyMessage('API key validated successfully.');
                setApiKey(localApiKey); // Sync with parent
            })
            .catch(error => {
                console.error('Error fetching country list:', error);
                setError('Invalid API key. Please generate or enter a valid key.');
                setCountries([]);
                setCountryLoading(false);
            });
    }, [localApiKey, setApiKey]);

    const handleGenerateApiKey = async () => {
        try {
            const response = await axios.post('http://localhost:5000/getapikey', {}, { withCredentials: true });
            if (response.data.success) {
                setLocalApiKey(response.data.data);
                setApiKey(response.data.data); // Sync with parent
                setApiKeyMessage(`API Key generated: ${response.data.data}`);
                setError('');
            } else {
                setApiKeyMessage(response.data.error || 'Failed to generate API key.');
            }
        } catch (error) {
            setApiKeyMessage('Error: ' + error.message);
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'country' && value) {
            setCountryLoading(true);
            setCountryData(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/countries/${value}`, {
                    headers: { 'X-API-Key': localApiKey }
                });
                if (response.data.success) {
                    const { name, capital, currencies, languages, flag } = response.data.data;
                    setCountryData(response.data.data);
                    setFormData({
                        ...formData,
                        country: name,
                        capital: capital || '',
                        currency: currencies?.map(c => `${c.name} (${c.code})`).join(', ') || '',
                        languages: languages?.join(', ') || '',
                        flag: flag || ''
                    });
                } else {
                    setFormData({
                        ...formData,
                        country: value,
                        capital: '',
                        currency: '',
                        languages: '',
                        flag: ''
                    });
                }
            } catch (error) {
                console.error('Error fetching country data:', error);
                setFormData({
                    ...formData,
                    country: value,
                    capital: '',
                    currency: '',
                    languages: '',
                    flag: ''
                });
            } finally {
                setCountryLoading(false);
            }
        } else if (name === 'apiKey') {
            setLocalApiKey(value);
            setApiKeyMessage('');
            setError('');
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localApiKey) {
            setError('Please generate or enter an API key.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/posts', {
                ...formData,
                date_of_visit: formData.dateOfVisit
            }, { withCredentials: true });
            if (response.data.success) {
                setFormData({
                    title: '',
                    content: '',
                    country: '',
                    dateOfVisit: '',
                    capital: '',
                    currency: '',
                    languages: '',
                    flag: ''
                });
                setCountryData(null);
                setError('');
                setApiKeyMessage('');
                onPostCreated();
            } else {
                setError(response.data.error || 'Failed to create post.');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Error creating post: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-semibold mb-6">Create a New Post</h2>
            {error && <div className="error text-red-500 mb-4 text-center">{error}</div>}
            {apiKeyMessage && (
                <div className={apiKeyMessage.includes('Error') || apiKeyMessage.includes('Failed') ? 'error' : 'success'}>{apiKeyMessage}</div>
            )}
            {loading && <div className="loading text-center">Creating post...</div>}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="section">
                    <h3>API Key</h3>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="apiKey"
                            value={localApiKey}
                            onChange={handleChange}
                            placeholder="Enter or Generate API Key"
                            className="border p-2 rounded flex-grow"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateApiKey}
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            Generate API Key
                        </button>
                    </div>
                </div>
                {countryLoading ? (
                    <div>Loading countries...</div>
                ) : (
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                        disabled={!localApiKey || countries.length === 0}
                    >
                        <option value="">Select a Country</option>
                        {countries.map(country => (
                            <option key={country.name} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                )}
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Post Title"
                    className="border p-2 rounded"
                    required
                />
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Post Content"
                    className="border p-2 rounded"
                    rows="4"
                    required
                />
                <input
                    type="date"
                    name="dateOfVisit"
                    value={formData.dateOfVisit}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
                {countryData && (
                    <div className="country-data-card mt-4">
                        <h4>{countryData.name}</h4>
                        <p><strong>Capital:</strong> {countryData.capital || 'N/A'}</p>
                        <p><strong>Currency:</strong> {countryData.currencies?.map(c => `${c.name} (${c.code})`).join(', ') || 'N/A'}</p>
                        <p><strong>Languages:</strong> {countryData.languages?.join(', ') || 'N/A'}</p>
                        <p><strong>Flag:</strong> {countryData.flag && <img src={countryData.flag} alt={`${countryData.name} flag`} width="100" />}</p>
                    </div>
                )}
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    disabled={loading || countryLoading}
                >
                    Create Post
                </button>
            </form>
        </div>
    );
};

export default CreatePost;