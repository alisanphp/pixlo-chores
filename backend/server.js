require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'calender_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: process.env.DB_PORT || 25060
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

// Create a middleware to attach pool to req object
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Routes
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/chores', require('./routes/chores'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/penalties', require('./routes/penalties'));

const PORT = process.env.SERVER_PORT || 3009;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { pool }; 