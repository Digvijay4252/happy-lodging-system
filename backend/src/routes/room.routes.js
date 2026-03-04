const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { createRoomValidation } = require('../validators/common.validator');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({ storage });

router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoomById);

router.post('/', authMiddleware, roleMiddleware('admin'), createRoomValidation, roomController.createRoom);
router.put('/:id', authMiddleware, roleMiddleware('admin'), roomController.updateRoom);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), roomController.deleteRoom);
router.post('/:id/images', authMiddleware, roleMiddleware('admin'), upload.single('image'), roomController.addRoomImage);

module.exports = router;
