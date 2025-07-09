const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Fungsi untuk menghasilkan JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token berlaku selama 1 jam
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Mohon masukkan semua kolom.' });
        }

        // Periksa apakah pengguna sudah ada
        const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Nama pengguna atau email sudah terdaftar.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan pengguna ke database
        const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        res.status(201).json({
            message: 'Registrasi berhasil!',
            userId: result.insertId,
            username: username,
            email: email,
            token: generateToken(result.insertId) // Beri token setelah registrasi
        });
    } catch (error) {
        next(error); // Teruskan error ke middleware penanganan error global
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({ message: 'Mohon masukkan nama pengguna dan kata sandi.' });
        }

        // Cari pengguna berdasarkan username
        const [users] = await pool.query('SELECT id, username, password FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Kredensial tidak valid.' });
        }

        const user = users[0];

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Kredensial tidak valid.' });
        }

        res.json({
            message: 'Login berhasil!',
            userId: user.id,
            username: user.username,
            token: generateToken(user.id)
        });
    } catch (error) {
        next(error); // Teruskan error ke middleware penanganan error global
    }
});

module.exports = router;