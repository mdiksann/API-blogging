const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Periksa apakah ada token di header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Dapatkan token dari header
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tambahkan user ID ke objek request
            req.userId = decoded.id;
            next(); // Lanjutkan ke middleware/route berikutnya
        } catch (error) {
            console.error('Token tidak valid:', error.message);
            return res.status(401).json({ message: 'Tidak diotorisasi, token gagal.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak diotorisasi, tidak ada token.' });
    }
};

module.exports = { protect };