# Country API Middleware Service

## Overview

A secure API service developed for the **University of Westminster 6COSC022W Advanced Server-Side Programming Coursework (2024/25)**. This service integrates with the `restcountries.com` API to provide country data and includes a social media platform for users to create, like, dislike, comment on, and follow blog posts about travel experiences. It features user authentication, API key management, session-based security, and a React frontend.

## Features

- **User Authentication**: Secure registration, login, and logout with session management.
- **API Key Management**: Generation and validation of API keys for authenticated users to access country data.
- **Country Data API**: Fetch country details (name, capital, currencies, languages, flag) from `restcountries.com`.
- **Blog Post Management**: Create, update, delete, and fetch blog posts with country-based filtering, username filtering, and sorting by `newest`, `most-liked`, or `most-commented`.
- **Likes and Dislikes**: Users can like or dislike posts, with counts tracked in the database.
- **Follow/Unfollow**: Users can follow others to view their posts in a personalized feed.
- **Search**: Search posts by country or username.
- **API Key Usage Tracking**: Monitors API key usage count and last used timestamp.
- **React Frontend**: User-friendly interface for authentication, API key management, post creation, and social interactions.
- **Docker Support**: Containerization for consistent deployment.

## Technologies

- **Backend**: Node.js (v22.13.1), Express.js
- **Database**: SQLite
- **Security**: bcrypt, express-session, CORS
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
docker run -d -p 5000:5000 -v C:/Users/Chalana/Documents/GitHub/server-side/countries.db:/app/countries.db country-api
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

#### User LogOut
- **Endpoint**: POST /api/logout
- **Description**: End user session
- **Body**: `{ "success": true, "message": "Logged out successfully" }`

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
  #### Blog Post Endpoints
- **Endpoint**: GET /api/posts
- **Description**: Fetch all blog posts with optional sorting and filtering
- **Query Parameters**: sort: newest, most-liked (default: newest)
                        country: Filter by country (e.g., France)
                        username: Filter by user’s full name
- **Example**: `GET /api/posts?sort=most-liked&country=France`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "title": "I travel to Japan",
        "content": "I Eat lots of sushi.",
        "country": "Japan",
        "likes": 4,
        "dislikes": 1,
        "fn": "hello",
        "sn": "world",
      }
    ]
  }
  ```
  #### Get Single Post
- **Endpoint**: GET /api/posts/:id
- **Description**: Fetch details for a specific post
- **Example**: `GET /api/posts/5`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
    "id": 5,
    "title": "I travel to Japan",
    "content": "I Eat lots of sushi.",
    "country": "Japan",
    "likes": 4,
    "dislikes": 1,
    "comment_count": 0,
  }
  }
  ```

#### Create Post
- **Endpoint**: GET api/posts
- **Description**: Create a new blog post
- **Authentication**: Requires active session
- **Response**:
  ```json
  { "success": true, 
    "data": { 
    "id": 6, 
    ... 
    } 
  }
  ```

#### Update Post
- **Endpoint**: PUT /api/posts
- **Description**: Update an existing post (user must be the author)
- **Authentication**: Requires active session
- **Response**:
  ```json
  {
    "success": true,
    "message": "Post updated"
  }
  ```

#### Delete Post
- **Endpoint**: DELETE /api/posts
- **Description**: Delete a post (user must be the author)
- **Authentication**: Requires active session
- **Response**:
  ```json
  {
    "success": true,
    "message": "Post deleted"
  }
  ```

#### Search Post
- **Endpoint**: GET /api/posts/search
- **Description**: Search posts by country or username
- **Authentication**: Requires active session
- **Example**: GET /api/posts/search?q=France&type=country
- **Response**:
  ```json
  {
    "success": true,
    "data": [
    {
      "id": 5,
      "title": "I travel to Japan",
      ...
    },
    ...
  ]
  }
  ```

#### Likes and Dislikes
- **Endpoint**: GET /api/likes
- **Description**: Fetch like and dislike counts for a post
- **Example**: GET /api/likes?postId=5
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "likes": 4,
      "dislikes": 1
    }
  }
  ```

#### Like/Dislike a Post
- **Endpoint**: POST /api/likes
- **Description**: Like or dislike a post.
- **Authentication**: Requires active session
- **Response**:
  ```json
  { "success": true, 
    "message": "Post liked" 
  }
  ```

#### Follow Endpoints
- **Endpoint**: POST /api/follow
- **Description**: Follow another user
- **Authentication**: Requires active session
- **Body**: { "followingId": 16 }
- **Response**:
  ```json
  { "success": true, 
    "message": "Followed successfully" 
  }
  ```

- **Endpoint**: DELETE /api/follow/:userId
- **Description**: Unfollow a user
- **Authentication**: Requires active session
- **Example**: DELETE /api/follow/16
- **Response**:
  ```json
  { "success": true, 
    "message": "Unfollowed successfully" 
  }
  ```

- **Endpoint**: GET /api/following
- **Description**: Fetch users the current user is following
- **Authentication**: Requires active session
- **Response**:
  ```json
  { 
    "success": true,
    "data": [{ "id": 16, "fn": "test", "sn": "user" }, ...]
  }
  ```

- **Endpoint**: GET /api/is-following/:userId
- **Description**: Check if the current user is following another user
- **Authentication**: Requires active session
- **Response**:
  ```json
  { 
    "success": true, 
    "isFollowing": true
  }
  ```

#### Feed Endpoint
- **Endpoint**: GET /api/feed
- **Description**: Fetch posts from users the current user follows
- **Authentication**: Requires active session
- **Response**:
  ```json
  { 
    "success": true,
      "data": [
        {
          "id": 2,
          "title": "I travel to Italy",
          "content": "I Eat lots of pizza.",
          ...
        },
        ...
      ]
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

- **Unauthorized** (401):
  ```json
  {
    "success": false,
    "error": "Unauthorized: No session found"
  }
  ```

- **Not Found** (404):
  ```json
  {
    "success": false,
    "error": "Post not found"
  }
  ```

- **Server Error** (500):
  ```json
  {
    "success": false,
    "error": "Server error: <message>"
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
│   ├── BlogPostDAO.js
│   ├── FollowDAO.js
│   ├── LikeDAO.js
│   ├── CountryDAO.js
│   └── UserDAO.js
├── Database/
│   └── SQLCon.js         # Database connection
├── Middleware/
│   ├── APIAuth/
│   │   └── APIAuthMiddleWare.js
│   └── SessionAuth/
│       └── SessionAuth.js
├── Routers/
│   ├── AuthRoutes.js
│   ├── BlogPostRoutes.js
│   ├── CountryRouter.js
│   ├── FollowRouter.js
│   ├── LikesRouter.js
│   ├── SearchRouter.js
│   └── SocialRouter.js
├── Services/
│   ├── APIKey.js
│   ├── BlogPostService.js
│   ├── CountryService.js
│   ├── FollowService.js
│   ├── LikesService.js
│   └── UserService.js
├── Utilities/
│   ├── bcryptUtil.js
│   └── createResponse.js
├── frontend/             # React frontend source
├── public/               # Built frontend files
├── countries.db          # SQLite database
├── Dockerfile
├── index.js              # Application entry point
├── .env                  # Environment variables
└── package.json
```

## Testing

1. **Registration/Login**:
   - Visit http://localhost:5000 to register and log in.
   - Test session persistence by accessing `GET /check-session` in Postman.

2. **API Key Generation**:
   - Log in and generate an API key via the dashboard or `POST /getapikey` in Postman.
   - Verify the key is returned in the response.

3. **Country Data Fetching**:
   - Test the country API with your generated key using `GET /api/countries/france?apiKey=your-api-key` in Postman.
   - Confirm details like name, capital, and flag are returned.

4. **Blog Post Management**:
   - Create a post via the frontend or `POST /api/posts` in Postman (requires login).
   - Fetch posts with sorting (`GET /api/posts?sort=most-liked`) and filtering (`GET /api/posts?country=France`).
   - Update or delete a post via `PUT /api/posts` or `DELETE /api/posts` (requires authorship).

5. **Likes and Dislikes**:
   - Like/dislike a post via the frontend or `POST /api/likes` in Postman (e.g., `{ "postId": 5, "type": "like" }`).
   - Check counts with `GET /api/likes?postId=5`.

6. **Follows and Feed**:
   - Follow a user via the frontend or `POST /api/follow` in Postman (e.g., `{ "followingId": 16 }`).
   - Check follow status with `GET /api/is-following/16`.
   - View followed users’ posts with `GET /api/feed`.

7. **Search**:
   - Search posts by country or username via the frontend or `GET /api/posts/search?q=France&type=country` in Postman.
   - Confirm relevant posts are returned.

8. **Security Testing**:
   - Verify unauthorized requests (e.g., `GET /api/posts` without a session) are rejected with a 401 error.
   - Test invalid API keys with `GET /api/countries/france?apiKey=invalid-key` to ensure a 401 response.

## License

This project was developed for educational purposes as part of the University of Westminster 6COSC022W Advanced Server-Side Programming coursework.