const express = require('express');
const router = express.Router();

const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/status', aiController.status);
router.get('/recommendations', aiController.smartRecommendations);
router.post('/chatbot', aiController.chatbot);
router.get('/revenue-prediction', aiController.revenuePrediction);
router.post('/sentiment', aiController.sentimentAnalysis);

module.exports = router;
