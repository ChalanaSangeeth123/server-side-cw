const express = require('express');
const userService = require('./src/controllers/userController');
const { AuthMiddleware, ValidationMiddleware } = require('./src/middleware');
const apiKeyMiddleware = require('./src/middleware/apiKeyAuth');
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/userRoutes');
const bookRoutes = require('./src/routes/bookRoutes');


const app = express();
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/api', apiKeyMiddleware);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

app.get('/api/data', (req, res) => {
  res.json({
      message: 'Protected data accessed successfully',
      keyInfo: {
          name: req.apiKey.name,
          lastUsed: req.apiKey.last_used
      }
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the User Management API!');
});


// Routes for user operations
app.post('/api/register', 
  ValidationMiddleware.validateUser, 
  userService.register
);

app.post('/api/login', 
  userService.login
);
app.get('/users',userService.getUsers);
app.get('/users/:id', userService.getUserById);
app.put('/users/:id',userService.updateUser);
app.delete('/users/:id', userService.deleteUser);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found'
  });
});
// Start the server
app.listen(4000, () => {
  console.log('Server is running on port 3000');
});
