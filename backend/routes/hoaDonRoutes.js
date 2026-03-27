const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/auto-create-status', hoaDonController.checkAutoCreateStatus);
router.post('/auto-create', hoaDonController.autoCreateHoaDon);
router.get('/latest-reading', hoaDonController.getLatestReading);

router.get('/', hoaDonController.getAllHoaDon);
router.get('/:id', hoaDonController.getHoaDonById);
router.post('/', hoaDonController.createHoaDon);
router.put('/:id', hoaDonController.updateHoaDon);
router.delete('/:id', hoaDonController.deleteHoaDon);

module.exports = router;
