const express = require('express');
const router = express.Router();
const chiSoDienNuocController = require('../controllers/chiSoDienNuocController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', chiSoDienNuocController.getAllChiSo);
router.get('/:id', chiSoDienNuocController.getChiSoById);
router.post('/', chiSoDienNuocController.createChiSo);
router.put('/:id', chiSoDienNuocController.updateChiSo);
router.delete('/:id', chiSoDienNuocController.deleteChiSo);

module.exports = router;
