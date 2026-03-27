const express = require('express');
const router = express.Router();
const phongController = require('../controllers/phongController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', phongController.getAllPhong);
router.get('/:id', phongController.getPhongById);
router.post('/', phongController.createPhong);
router.put('/:id', phongController.updatePhong);
router.delete('/:id', phongController.deletePhong);

module.exports = router;
