const express = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, User, Course } = require("../db");
const { hashPassword, verifyOrUpgradePassword, issueSession } = require("../utils/auth");
const { readCredentials, validateNewAccount, validateLogin } = require("../utils/validation");
const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const credentials = readCredentials(req);
        const validationError = validateNewAccount(credentials);

        if (validationError) {
            return res.status(400).json({ msg: validationError });
        }

        const existingAdmin = await Admin.exists({ username: credentials.username });

        if (existingAdmin) {
            return res.status(409).json({ msg: 'Username already exists' });
        }

        const password = await hashPassword(credentials.password);
        const admin = await Admin.create({
            username: credentials.username,
            password
        });
        const account = issueSession(res, admin, 'admin');

        return res.status(201).json({
            message: 'Admin created successfully',
            admin: account
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

        const admins = await Admin.find({ username: credentials.username });
        let matchedAdmin = null;

        for (const admin of admins) {
            if (await verifyOrUpgradePassword(Admin, admin, credentials.password)) {
                matchedAdmin = admin;
                break;
            }
        }

        if (!matchedAdmin) {
            return res.status(401).json({ msg: 'Invalid username or password' });
        }

        const account = issueSession(res, matchedAdmin, 'admin');

        return res.json({
            message: 'Login successful',
            admin: account
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/courses', adminMiddleware, async (req, res, next) => {
    try {
        const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
        const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
        const imageLink = typeof req.body?.imageLink === 'string' ? req.body.imageLink.trim() : '';
        const price = Number(req.body?.price);

        if (!title) {
            return res.status(400).json({ msg: 'Course title is required' });
        }

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({ msg: 'Course price must be a non-negative number' });
        }

        const newCourse = await Course.create({
            title,
            description,
            imageLink,
            price
        });

        return res.status(201).json({
            message: 'Courses created successfully',
            courseId: newCourse._id,
            course: newCourse
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/courses', adminMiddleware, async (req, res, next) => {
    try {
        const courses = await Course.find({});
        return res.json({ courses });
    } catch (error) {
        return next(error);
    }
});

router.get('/stats', adminMiddleware, async (req, res, next) => {
    try {
        const [totalCourses, totalUsers, purchaseSummary, courseSummary] = await Promise.all([
            Course.countDocuments({}),
            User.countDocuments({}),
            User.aggregate([
                { $project: { count: { $size: { $ifNull: ['$purchasedCourses', []] } } } },
                { $group: { _id: null, total: { $sum: '$count' } } }
            ]),
            Course.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$price' },
                        averagePrice: { $avg: '$price' }
                    }
                }
            ])
        ]);

        return res.json({
            stats: {
                totalCourses,
                totalUsers,
                totalPurchases: purchaseSummary[0]?.total || 0,
                totalCatalogValue: courseSummary[0]?.totalValue || 0,
                averagePrice: courseSummary[0]?.averagePrice || 0
            }
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
