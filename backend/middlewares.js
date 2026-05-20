const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    console.log("Auth Middleware - Received Token:", token);

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        console.log("Decoded Token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };