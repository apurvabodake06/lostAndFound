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

// Public routes
router.get('/', getItems);
router.get('/recent', getRecentItems);
router.get('/search', searchItems);
router.get('/:id', getItem);

// For development/testing - allow adding items without auth
// In production, this should use auth middleware
router.post('/', upload.single('image'), createItem);

// Handle claims - public route for students to claim items
router.put('/:id/claim', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Log the request body to see what's coming in
    console.log('Claim request body:', JSON.stringify(req.body, null, 2));
    
    // Get the item from the database
    const Item = require('../models/Item');
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Only allow claiming available items
    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This item is not available for claiming'
      });
    }
    
    // Prepare the claimedBy data, ensuring all keys are correctly mapped
    const claimedBy = {
      studentName: req.body.studentName,
      rollNumber: req.body.studentId,  // Map studentId to rollNumber as per model
      studyYear: req.body.studentYear,
      contactNumber: req.body.contactNumber,
      claimedDate: req.body.claimedDate || new Date()
    };
    
    // Log the prepared claimedBy data
    console.log('Prepared claimedBy data:', JSON.stringify(claimedBy, null, 2));
    
    // Update the item directly using findByIdAndUpdate to ensure atomic update
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { 
        status: 'claimed',
        claimedBy: claimedBy
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedItem) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update item'
      });
    }
    
    // Log the updated item to verify
    console.log('Updated item:', JSON.stringify(updatedItem, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Item claimed successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while claiming item',
      error: error.message
    });
  }
});

// Protected routes (guard only) - these would require proper auth in production
// router.use(protect, authorize('guard'));
// router.post('/', upload.single('image'), createItem);
router.put('/:id', upload.single('image'), updateItem);
router.put('/:id/delivered', markAsDelivered);

// General status update route
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['available', 'claimed', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const Item = require('../models/Item');
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item status'
    });
  }
});

router.delete('/:id', deleteItem);

module.exports = router;