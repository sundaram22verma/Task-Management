require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection for serverless environments (e.g. Vercel)
app.use(async (req, res, next) => {
  // Skip DB connection for static/health check if needed, but safe to invoke cached connectDB
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root welcome route (prevents 404 when opening Vercel URL in browser)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Task Management REST API with RBAC',
    status: 'Operational',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      admin: '/api/admin',
      dashboard: '/api/dashboard',
    },
  });
});

// Base health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management REST API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
