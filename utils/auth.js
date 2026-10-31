const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const SESSION_COOKIE = 'csa_session';
const BCRYPT_ROUNDS = 12;

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function verifyPassword(password, passwordHash) {
    if (!isBcryptHash(passwordHash)) {
        return Promise.resolve(false);
    }

    return bcrypt.compare(password, passwordHash);
}

function plaintextMatches(password, storedPassword) {
    const submittedHash = crypto.createHash('sha256').update(password, 'utf8').digest();
    const storedHash = crypto.createHash('sha256').update(storedPassword, 'utf8').digest();

    return crypto.timingSafeEqual(submittedHash, storedHash);
}

async function verifyOrUpgradePassword(Model, account, password) {
    if (isBcryptHash(account.password)) {
        return bcrypt.compare(password, account.password);
    }

    if (!plaintextMatches(password, account.password)) {
        return false;
    }

    const passwordHash = await hashPassword(password);
    const result = await Model.updateOne(
        {
            _id: account._id,
            password: account.password
        },
        {
            $set: { password: passwordHash }
        }
    );

    if (result.matchedCount > 0) {
        return true;
    }

    const currentAccount = await Model.findById(account._id);

    return currentAccount
        ? verifyPassword(password, currentAccount.password)
        : false;
}

function signSession(account, role) {
    return jwt.sign(
        {
            sub: account._id.toString(),
            username: account.username,
            role
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
}

function setSessionCookie(res, token) {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        maxAge: config.sessionMaxAgeMs,
        path: '/'
    });
}

function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        path: '/'
    });
}

function toPublicAccount(account, role) {
    return {
        id: account._id.toString(),
        username: account.username,
        role
    };
}

function issueSession(res, account, role) {
    const token = signSession(account, role);
    setSessionCookie(res, token);
    return toPublicAccount(account, role);
}

function getSessionToken(req) {
    const cookieToken = req.cookies?.[SESSION_COOKIE];

    if (cookieToken) {
        return cookieToken;
    }

    const authorization = req.get('authorization');

    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.slice(7).trim() || null;
    }

    return null;
}

module.exports = {
    SESSION_COOKIE,
    isBcryptHash,
    hashPassword,
    verifyPassword,
    verifyOrUpgradePassword,
    setSessionCookie,
    clearSessionCookie,
    toPublicAccount,
    issueSession,
    getSessionToken
};
