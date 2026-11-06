// FarmConnect AI Assistant Routes (Phases 15, 16, 17)
const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');

router.post('/chat', aiAssistantController.handleChat);
router.get('/suggested-prompts', aiAssistantController.getSuggestedPrompts);

module.exports = router;
