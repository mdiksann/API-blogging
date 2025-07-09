const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log error stack ke konsol server

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal server.';

    res.status(statusCode).json({
        success: false,
        message: message,
        // Hanya kirim stack trace di lingkungan pengembangan
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;