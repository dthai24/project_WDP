
const express = require('express');
const questionBankRoutes = express.Router();

const {
    getAllBankOfMentor
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


questionBankRoutes.get('/getAllBankOfMentor', optionalAuth, getAllBankOfMentor);
module.exports = questionBankRoutes;