const logger = require('../config/logger');

const getStatus = (req, res) => {
    const status = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date()
    };
    res.json(status);
};

const uploadSingleFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    logger.info(`File uploaded successfully: ${req.file.filename}`);
    res.json({
        message: 'File uploaded successfully',
        file: req.file
    });
};

const uploadMultipleFiles = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    logger.info(`${req.files.length} files uploaded successfully`);
    res.json({
        message: 'Files uploaded successfully',
        files: req.files
    });
};

module.exports = {
    getStatus,
    uploadSingleFile,
    uploadMultipleFiles
};