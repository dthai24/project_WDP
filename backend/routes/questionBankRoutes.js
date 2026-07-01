
const express = require('express');
const questionBankRoutes = express.Router();

const {
    getAllBankOfMentor,
    getChapterSections,
    getSectionQuestions,
    getQuestionBankByIdController
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
questionBankRoutes.get('/getBankById/:bankId', optionalAuth, getQuestionBankByIdController);
questionBankRoutes.get('/getAllBankOfMentor', optionalAuth, getAllBankOfMentor);
questionBankRoutes.get('/courses/:courseId/paths/:pathId/sections', optionalAuth, getChapterSections);
questionBankRoutes.get('/sections/:sectionId/questions', optionalAuth, getSectionQuestions);

module.exports = questionBankRoutes;