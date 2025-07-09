const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET all posts
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// GET a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// CREATE a new post
router.post('/', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Judul dan konten tidak boleh kosong.' });
        }
        const [result] = await pool.query('INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', [title, content, author]);
        res.status(201).json({ id: result.insertId, title, content, author, message: 'Postingan berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// UPDATE a post by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Judul dan konten tidak boleh kosong.' });
        }
        const [result] = await pool.query('UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?', [title, content, author, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }
        res.json({ message: 'Postingan berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// DELETE a post by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }
        res.json({ message: 'Postingan berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

module.exports = router;