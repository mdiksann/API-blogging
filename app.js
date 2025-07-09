require('dotenv').config();
const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/posts');
const { testDbConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Mengizinkan permintaan lintas domain
app.use(express.json()); // Mengizinkan parsing JSON dari body request

// Test database connection on startup
testDbConnection();

// Routes
app.use('/api/posts', postRoutes);

// Basic home route
app.get('/', (req, res) => {
    res.send('Welcome to the Blog API!');
});

// Error handling middleware (optional but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});