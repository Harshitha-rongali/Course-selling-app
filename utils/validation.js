function readCredentials(req) {
    const bodyUsername = req.body?.username;
    const bodyPassword = req.body?.password;
    const username = typeof bodyUsername === 'string' ? bodyUsername : req.headers.username;
    const password = typeof bodyPassword === 'string' ? bodyPassword : req.headers.password;

    return {
        username: typeof username === 'string' ? username.trim() : '',
        password: typeof password === 'string' ? password : ''
    };
}

function validateNewAccount({ username, password }) {
    if (username.length < 3 || username.length > 50) {
        return 'Username must be between 3 and 50 characters.';
    }

    if (password.length < 6 || password.length > 128) {
        return 'Password must be between 6 and 128 characters.';
    }

    return null;
}

function validateLogin({ username, password }) {
    if (!username || !password) {
        return 'Username and password are required.';
    }

    if (password.length > 128) {
        return 'Invalid username or password.';
    }

    return null;
}

module.exports = {
    readCredentials,
    validateNewAccount,
    validateLogin
};
