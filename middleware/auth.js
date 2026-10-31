const jwt = require('jsonwebtoken');
const config = require('../config');
const { Admin, User } = require('../db');
const { getSessionToken } = require('../utils/auth');

const models = {
    user: User,
    admin: Admin
};

async function resolveSession(req) {
    const token = getSessionToken(req);

    if (!token) {
        return null;
    }

    const payload = jwt.verify(token, config.jwtSecret);

    if (!payload.sub || (payload.role !== 'user' && payload.role !== 'admin')) {
        return null;
    }

    const account = await models[payload.role]
        .findById(payload.sub)
        .select('-password');

    if (!account) {
        return null;
    }

    return {
        role: payload.role,
        account
    };
}

function createRoleMiddleware(role) {
    return async function roleMiddleware(req, res, next) {
        try {
            const session = await resolveSession(req);

            if (!session || session.role !== role) {
                return res.status(401).json({ msg: 'Authentication required' });
            }

            req.auth = session;
            return next();
        } catch {
            return res.status(401).json({ msg: 'Authentication required' });
        }
    };
}

async function sessionMiddleware(req, res, next) {
    try {
        const session = await resolveSession(req);

        if (!session) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        req.auth = session;
        return next();
    } catch {
        return res.status(401).json({ msg: 'Authentication required' });
    }
}

module.exports = {
    userMiddleware: createRoleMiddleware('user'),
    adminMiddleware: createRoleMiddleware('admin'),
    sessionMiddleware
};
