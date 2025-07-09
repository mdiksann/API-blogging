require('dotenv').config();
const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth'); // Impor rute autentikasi
const { testDbConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler'); // Impor middleware penanganan error

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testDbConnection();

// Routes
app.use('/api/auth', authRoutes); // Gunakan rute autentikasi
app.use('/api/posts', postRoutes);

// Basic home route
app.get('/', (req, res) => {
    res.send('Welcome to the Blog API!');
});

// Middleware penanganan error global (harus diletakkan paling akhir setelah semua rute)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});