const express = require('express');
const questionBankRoutes = express.Router();

const {
  getAllBankOfMentor,
  getAllQuestionBankByMentorId,
  getCoursePathBanks,
  getPathQuestions,
  getBankQuestions,
  getBankPaths,
  createPathQuestions,
  patchPathQuestions,
  patchQuestionActive,
  deletePathQuestion,
  patchAllQuestionsActive,
} = require('../controllers/questionBankController');

const optionalAuth = (req, _res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (userId) {
    req.user = { userId: Number(userId) };
  }
  next();
};

questionBankRoutes.use(optionalAuth);

questionBankRoutes.get('/getAllBankOfMentor', getAllBankOfMentor);
questionBankRoutes.get('/getAll', getAllQuestionBankByMentorId);
questionBankRoutes.get('/courses/:courseId/path-banks', getCoursePathBanks);
questionBankRoutes.get('/courses/:courseId/paths/:pathId/questions', getPathQuestions);
questionBankRoutes.post('/courses/:courseId/paths/:pathId/questions', createPathQuestions);
questionBankRoutes.patch('/courses/:courseId/paths/:pathId/questions', patchPathQuestions);
questionBankRoutes.patch('/courses/:courseId/paths/:pathId/questions/active-all', patchAllQuestionsActive);
questionBankRoutes.patch('/courses/:courseId/paths/:pathId/questions/:questionId/active', patchQuestionActive);
questionBankRoutes.delete('/courses/:courseId/paths/:pathId/questions/:questionId', deletePathQuestion);
questionBankRoutes.get('/:bankId/paths', getBankPaths);
questionBankRoutes.get('/:bankId/questions', getBankQuestions);

module.exports = questionBankRoutes;
