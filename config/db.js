require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Koneksi ke database MySQL berhasil!');
        connection.release(); // Lepaskan koneksi kembali ke pool
    } catch (error) {
        console.error('Koneksi database gagal:', error.message);
        process.exit(1); // Keluar dari aplikasi jika koneksi gagal
    }
}

module.exports = { pool, testDbConnection };