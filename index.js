const config = require('./config');
const mongoose = require('mongoose');
require('./db');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");

const app = express();

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected.');
});

mongoose.connection.on('error', () => {
    console.error('MongoDB connection error.');
});

if (config.isProduction) {
    app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(cors({
    origin: config.clientOrigin,
    credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.use((req, res) => {
    return res.status(404).json({ msg: 'Not found' });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ msg: 'Invalid JSON body' });
    }

    if (error.type === 'entity.too.large') {
        return res.status(413).json({ msg: 'Request body too large' });
    }

    const status = error.status || error.statusCode;

    if (Number.isInteger(status) && status >= 400 && status < 500) {
        return res.status(status).json({ msg: 'Request could not be processed' });
    }

    console.error('Request error:', error.message);
    return res.status(500).json({ msg: 'Internal server error' });
});

if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
}

module.exports = app;