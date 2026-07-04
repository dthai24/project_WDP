
const express = require('express');
const questionBankRoutes = express.Router();

const {
    getAllBankOfMentor,
    getChapterSections,
    getSectionQuestions,
    getQuestionBankByIdController,
    getQuestionBankPathsByBankIdController,
    createSectionSave,
    updateSectionSave,
    deleteSection,
    patchSectionSourceUrl,
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
questionBankRoutes.get('/getBankPaths/:bankId', optionalAuth, getQuestionBankPathsByBankIdController)
questionBankRoutes.get('/getBankById/:bankId', optionalAuth, getQuestionBankByIdController);
questionBankRoutes.get('/getAllBankOfMentor', optionalAuth, getAllBankOfMentor);
questionBankRoutes.get('/courses/:courseId/paths/:pathId/sections', optionalAuth, getChapterSections);
questionBankRoutes.post('/courses/:courseId/paths/:pathId/sections', optionalAuth, createSectionSave);
questionBankRoutes.get('/sections/:sectionId/questions', optionalAuth, getSectionQuestions);
questionBankRoutes.put('/sections/:sectionId', optionalAuth, updateSectionSave);
questionBankRoutes.patch('/sections/:sectionId/source-url', optionalAuth, patchSectionSourceUrl);
questionBankRoutes.delete('/sections/:sectionId', optionalAuth, deleteSection);

module.exports = questionBankRoutes;