const express = require('express');
const router = express.Router();
const {
  getItems,
  getRecentItems,
  searchItems,
  getItem,
  createItem,
  updateItem,
  markAsDelivered,
  deleteItem
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/uploadMiddleware');

router.get('/', getItems);
router.get('/recent', getRecentItems);
router.get('/search', searchItems);
router.get('/:id', getItem);

// Protected routes (guard only)
router.use(protect, authorize('guard'));

router.post('/', upload.single('image'), createItem);
router.put('/:id', updateItem);
router.put('/:id/delivered', markAsDelivered);
router.delete('/:id', deleteItem);

module.exports = router;