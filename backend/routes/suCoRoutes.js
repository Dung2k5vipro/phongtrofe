const express = require('express');
const router = express.Router();
const suCoController = require('../controllers/suCoController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', suCoController.getAllSuCo);
router.get('/:id', suCoController.getSuCoById);
router.post('/', suCoController.createSuCo);
router.put('/:id', suCoController.updateSuCo);
router.delete('/:id', suCoController.deleteSuCo);

module.exports = router;
