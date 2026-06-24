const express = require('express');
const router = express.Router();

const {
    getAllQuestionBankByMentorId
} = require('../controllers/questionBankController');

const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (userId) {
        req.user = {
            userId: Number(userId),
        };
    }

    next();
};

router.use(optionalAuth);

router.get('/getAll', optionalAuth, getAllQuestionBankByMentorId)

module.exports = router;
