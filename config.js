const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

function requireEnv(name) {
    const value = process.env[name];

    if (!value || !value.trim()) {
        throw new Error(`${name} is required. Add it to the local .env file.`);
    }

    return value.trim();
}

function readPositiveNumber(name, fallback) {
    const value = Number.parseInt(process.env[name] || '', 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

module.exports = {
    mongoUri: requireEnv('MONGODB_URI'),
    jwtSecret: requireEnv('JWT_SECRET'),
    port: readPositiveNumber('PORT', 3000),
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    sessionMaxAgeMs: readPositiveNumber('SESSION_MAX_AGE_MS', 7 * 24 * 60 * 60 * 1000),
    isProduction: process.env.NODE_ENV === 'production',
};
