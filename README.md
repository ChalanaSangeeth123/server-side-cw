# Country API Middleware Service

## Overview

A secure API middleware service developed for the **University of Westminster 6COSC022W Advanced Server-Side Programming Coursework 1 (2024/25)**. This service interfaces with the `restcountries.com` API to provide country data while implementing user authentication, API key management, and usage tracking features.

## Features

- **User Authentication**: Secure registration and login with session management
- **API Key Management**: Generation and validation of API keys for authenticated users
- **Country Data API**: Access to country details including name, capital, currencies, languages, and flag
- **API Key Usage Tracking**: Monitoring of key usage count and last used timestamp
- **React Frontend**: User-friendly interface for registration, login, and API key management
- **Docker Support**: Containerization for consistent deployment

## Technologies

- **Backend**: Node.js (v22.13.1), Express.js
- **Database**: SQLite
- **Security**: bcrypt, express-session
- **Frontend**: React
- **API Integration**: axios
- **Containerization**: Docker

## Installation

### Prerequisites

- Node.js (v22.13.1 or later)
- Docker (optional)
- Git

### Clone the Repository

```bash
git clone https://github.com/ChalanaSangeeth123/server-side-cw.git
cd server-side
```

### Install Dependencies

```bash
# Install backend dependencies
npm install

# Install and build frontend (if not already built)
cd frontend
npm install
npm run build
cd ..
```

### Environment Configuration

Create a `.env` file in the root directory:

```
DATABASE_PATH=./countries.db
SESSION_SECRET=my_secret_key
```

## Running the Application

### Local Development

```bash
node index.js
```

You should see:
```
Server has started and is listening on port: 5000
Connected to SQLite database
```

Access the application at http://localhost:5000

### Docker Deployment

```bash
# Build the Docker image
docker build -t country-api .

# Run the container
docker run -p 5000:5000 country-api
```

Access the application at http://localhost:5000

## API Documentation

### Authentication Endpoints

#### User Registration
- **Endpoint**: POST /api/register
- **Description**: Register a new user
- **Body**: `{ "username": "user", "password": "password" }`

#### User Login
- **Endpoint**: POST /api/login
- **Description**: Authenticate a user
- **Body**: `{ "username": "user", "password": "password" }`

### API Key Management

#### Generate API Key
- **Endpoint**: POST /api/generate-api-key
- **Description**: Generate a new API key
- **Authentication**: Requires active user session
- **Response**:
  ```json
  {
    "success": true,
    "data": "your-api-key",
    "error": null
  }
  ```

### Country Data Endpoints

#### Get Country Information
- **Endpoint**: GET /api/countries/:name
- **Description**: Fetch details for a specific country
- **Authentication**: Requires valid API key as query parameter
- **Example**: `GET /api/countries/france?apiKey=your-api-key`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "name": "France",
      "capital": "Paris",
      "currencies": [{ "code": "EUR", "name": "Euro" }],
      "languages": ["French"],
      "flag": "https://flagcdn.com/fr.png"
    },
    "error": null
  }
  ```

## Error Handling

### Common Error Responses

- **Missing API Key** (401):
  ```json
  {
    "success": false,
    "data": null,
    "error": "API key required"
  }
  ```

- **Invalid API Key** (401):
  ```json
  {
    "success": false,
    "data": null,
    "error": "Invalid or inactive API key"
  }
  ```

## API Key Usage Tracking

The system automatically tracks:
- **Usage Count**: Number of times an API key has been used
- **Last Used**: Timestamp of the most recent usage

This information is stored in the `apikeys` table and updated on each successful API request.

## Project Structure

```
server-side/
├── DAOs/                 # Data Access Objects
│   ├── APIKeyDAO.js
│   ├── CountryDAO.js
│   └── UserDAO.js
├── Database/
│   └── SQLCon.js         # Database connection
├── Routers/
│   └── CountryRouter.js  # API route definitions
├── Services/
│   ├── APIKey.js         # API key management
│   ├── CountryService.js # Country data handling
│   └── UserService.js    # Authentication logic
├── Utilities/
│   ├── bcryptUtil.js     # Password encryption
│   └── createResponse.js # Response formatting
├── frontend/             # React frontend source
├── public/               # Built frontend files
├── countries.db          # SQLite database
├── Dockerfile
├── index.js              # Application entry point
└── package.json
```

## Testing

1. **Registration/Login**: Visit http://localhost:5000 to register and log in
2. **API Key Generation**: Generate an API key from the dashboard after login
3. **Data Fetching**: Test the API endpoint with your generated key
4. **Security Testing**: Verify that unauthorized requests are properly rejected

## License

This project was developed for educational purposes as part of the University of Westminster 6COSC022W Advanced Server-Side Programming coursework.