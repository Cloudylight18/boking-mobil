const express = require('express');
const router = express.Router();
const kc = require('../controllers/knowledgeController');

router.get('/', kc.getKnowledge);
router.post('/', kc.createKnowledge);
router.put('/:id', kc.updateKnowledge);
router.delete('/:id', kc.deleteKnowledge);

module.exports = router;