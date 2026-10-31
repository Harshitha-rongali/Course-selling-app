const { Router } = require('express');
const { sessionMiddleware } = require('../middleware/auth');
const { clearSessionCookie, toPublicAccount } = require('../utils/auth');
const router = Router();

router.get('/me', sessionMiddleware, (req, res) => {
    return res.json({
        role: req.auth.role,
        account: toPublicAccount(req.auth.account, req.auth.role)
    });
});

router.post('/logout', (req, res) => {
    clearSessionCookie(res);
    return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
