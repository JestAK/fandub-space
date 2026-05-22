const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const logger = require('./config/logger');
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

const responseTimeMiddleware = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
        logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${timeInMs}ms`);
    });
    next();
};

const errorHandlerMiddleware = (err, req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`);

    if (err instanceof require('multer').MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    res.status(500).json({ error: err.message || 'Internal Server Error' });
};


const localCache = new NodeCache({ stdTTL: 60 });
const cacheMiddleware = (req, res, next) => {
    const key = req.originalUrl;
    const cachedData = localCache.get(key);

    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
        localCache.set(key, JSON.stringify(body));
        res.sendResponse(body);
    };

    next();
};

module.exports = { authMiddleware, responseTimeMiddleware, errorHandlerMiddleware, cacheMiddleware };