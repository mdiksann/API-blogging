const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware'); // Impor middleware protect

// GET all posts (Public)
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT p.*, u.username as author_username FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC');
        res.json(rows);
    } catch (err) {
        next(err); // Teruskan error ke middleware penanganan error global
    }
});

// GET a single post by ID (Public)
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT p.*, u.username as author_username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// CREATE a new post (Protected)
// Tambahkan `protect` middleware di sini
router.post('/', protect, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const author_id = req.userId; // Ambil author_id dari token yang sudah diverifikasi

        if (!title || !content) {
            return res.status(400).json({ message: 'Judul dan konten tidak boleh kosong.' });
        }
        const [result] = await pool.query('INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)', [title, content, author_id]);
        res.status(201).json({ id: result.insertId, title, content, author_id, message: 'Postingan berhasil ditambahkan.' });
    } catch (err) {
        next(err);
    }
});

// UPDATE a post by ID (Protected & Authorized)
// Tambahkan `protect` middleware di sini
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.userId; // ID pengguna dari token

        if (!title || !content) {
            return res.status(400).json({ message: 'Judul dan konten tidak boleh kosong.' });
        }

        // Periksa apakah postingan ada dan apakah pengguna adalah penulisnya
        const [post] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);

        if (post.length === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }

        if (post[0].author_id !== userId) {
            return res.status(403).json({ message: 'Tidak diotorisasi untuk memperbarui postingan ini.' });
        }

        const [result] = await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id]);
        
        res.json({ message: 'Postingan berhasil diperbarui.' });
    } catch (err) {
        next(err);
    }
});

// DELETE a post by ID (Protected & Authorized)
// Tambahkan `protect` middleware di sini
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // ID pengguna dari token

        // Periksa apakah postingan ada dan apakah pengguna adalah penulisnya
        const [post] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);

        if (post.length === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }

        if (post[0].author_id !== userId) {
            return res.status(403).json({ message: 'Tidak diotorisasi untuk menghapus postingan ini.' });
        }

        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
        
        res.json({ message: 'Postingan berhasil dihapus.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;