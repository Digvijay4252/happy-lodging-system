const express = require('express');
const multer = require('multer');
const router = express.Router();

const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({ storage });

router.use(authMiddleware);

// Shared (authenticated) endpoints
router.get('/menu', foodController.getMenuForDateSlot);

// Admin/Staff management
router.get('/items', roleMiddleware('admin', 'staff'), foodController.listFoodItems);
router.post('/items', roleMiddleware('admin', 'staff'), foodController.createFoodItem);
router.put('/items/:id', roleMiddleware('admin', 'staff'), foodController.updateFoodItem);
router.delete('/items/:id', roleMiddleware('admin', 'staff'), foodController.deleteFoodItem);
router.post('/items/:id/image', roleMiddleware('admin', 'staff'), upload.single('image'), foodController.addFoodItemImage);
router.get('/menus', roleMiddleware('admin', 'staff'), foodController.listDailyMenus);
router.post('/menus/upsert', roleMiddleware('admin', 'staff'), foodController.upsertDailyMenu);
router.post('/menus/carry-forward', roleMiddleware('admin', 'staff'), foodController.carryForwardForDate);
router.get('/orders', roleMiddleware('admin', 'staff'), foodController.listMealOrders);
router.patch('/orders/:id/status', roleMiddleware('admin', 'staff'), foodController.updateMealOrderStatus);

// Customer endpoints
router.post('/orders', roleMiddleware('customer'), foodController.placeMealOrder);
router.get('/orders/me', roleMiddleware('customer'), foodController.getMyMealOrders);
router.patch('/orders/:id/cancel', roleMiddleware('customer'), foodController.cancelMyMealOrder);

module.exports = router;
