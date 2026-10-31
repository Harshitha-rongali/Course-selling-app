const mongoose = require("mongoose");
const { Router } = require("express");
const { User, Course } = require("../db");
const userMiddleware = require("../middleware/user");
const { hashPassword, verifyOrUpgradePassword, issueSession } = require("../utils/auth");
const { readCredentials, validateNewAccount, validateLogin } = require("../utils/validation");
const router = Router();

router.post('/signup', async (req, res, next) => {
    try {
        const credentials = readCredentials(req);
        const validationError = validateNewAccount(credentials);

        if (validationError) {
            return res.status(400).json({ msg: validationError });
        }

        const existingUser = await User.exists({ username: credentials.username });

        if (existingUser) {
            return res.status(409).json({ msg: 'Username already exists' });
        }

        const password = await hashPassword(credentials.password);
        const user = await User.create({
            username: credentials.username,
            password
        });
        const account = issueSession(res, user, 'user');

        return res.status(201).json({
            message: 'User created successfully',
            user: account
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const credentials = readCredentials(req);
        const validationError = validateLogin(credentials);

        if (validationError) {
            return res.status(400).json({ msg: validationError });
        }

        const user = await User.findOne({ username: credentials.username });
        const passwordMatches = user
            ? await verifyOrUpgradePassword(User, user, credentials.password)
            : false;

        if (!user || !passwordMatches) {
            return res.status(401).json({ msg: 'Invalid username or password' });
        }

        const account = issueSession(res, user, 'user');

        return res.json({
            message: 'Login successful',
            user: account
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/courses', async (req, res, next) => {
    try {
        const courses = await Course.find({});
        return res.json({ courses });
    } catch (error) {
        return next(error);
    }
});

router.post('/courses/:courseId', userMiddleware, async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ msg: 'Invalid course ID' });
        }

        const courseExists = await Course.exists({ _id: courseId });

        if (!courseExists) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const result = await User.updateOne(
            {
                _id: req.auth.account._id,
                purchasedCourses: { $ne: courseId }
            },
            {
                $addToSet: { purchasedCourses: courseId }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(409).json({ msg: 'Course already purchased' });
        }

        return res.json({ message: 'Purchase complete!' });
    } catch (error) {
        return next(error);
    }
});

router.get('/purchasedCourses', userMiddleware, async (req, res, next) => {
    try {
        const courses = await Course.find({
            _id: { $in: req.auth.account.purchasedCourses }
        });

        return res.json({ courses });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
