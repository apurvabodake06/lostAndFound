const Item = require('../models/Item');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find().sort('-createdAt');
  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get recent items
// @route   GET /api/items/recent
// @access  Public
const getRecentItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ status: 'available' })
    .sort('-createdAt')
    .limit(8);
  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Search items
// @route   GET /api/items/search
// @access  Public
const searchItems = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a search term'
    });
  }

  console.log(`Searching for items with query: ${q}`);
  const items = await Item.searchItems(q);
  console.log(`Found ${items.length} items matching the search term`);
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  
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
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  // Handle file upload
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  // Add user to req.body if auth system is active
  if (req.user && req.user.username) {
    req.body.addedBy = req.user.username;
  } else {
    req.body.addedBy = 'pict_guard'; // Default fallback
  }

  try {
    const item = await Item.create({
      ...req.body,
      image: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    // If there's an error, clean up the uploaded file
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    throw error;
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = asyncHandler(async (req, res) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  // Make sure user is guard/admin - in real system this would check roles
  // For now, we're using the temporary auth system so this check is simplified
  if (req.user && req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  // Only allow updating items with 'available' status
  if (item.status !== 'available') {
    return res.status(400).json({
      success: false,
      message: 'Only available items can be edited'
    });
  }

  // Handle file upload
  const updateData = { ...req.body };
  
  // If a new image was uploaded
  if (req.file) {
    // Delete old image if it exists
    if (item.image) {
      const oldImagePath = path.join(__dirname, '../public', item.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Set the new image path
    updateData.image = `/uploads/${req.file.filename}`;
  }

  item = await Item.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Mark item as delivered
// @route   PUT /api/items/:id/delivered
// @access  Private
const markAsDelivered = asyncHandler(async (req, res) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  // Make sure user is guard/admin - in real system this would check roles
  // For now, we're using the temporary auth system so this check is simplified
  if (req.user && req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  // Only items with 'claimed' status can be marked as delivered
  if (item.status !== 'claimed') {
    return res.status(400).json({
      success: false,
      message: 'Only claimed items can be marked as delivered'
    });
  }

  // Preserve the existing claimedBy information
  const claimedByData = req.body.claimedBy || item.claimedBy;
  
  // Ensure the claimedDate is preserved
  if (!claimedByData.claimedDate && item.claimedBy && item.claimedBy.claimedDate) {
    claimedByData.claimedDate = item.claimedBy.claimedDate;
  }

  item = await Item.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'delivered',
      claimedBy: claimedByData
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  // Make sure user is guard/admin - in real system this would check roles
  // For now, we're using the temporary auth system so this check is simplified
  if (req.user && req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to delete this item'
    });
  }

  // Delete main item image file
  if (item.image) {
    const imagePath = path.join(__dirname, '../public', item.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Delete ID proof image if it exists (for claimed items)
  if (item.claimedBy && item.claimedBy.idProofImage) {
    const idProofPath = path.join(__dirname, '../public', item.claimedBy.idProofImage);
    if (fs.existsSync(idProofPath)) {
      fs.unlinkSync(idProofPath);
    }
  }

  // Using findByIdAndDelete instead of remove()
  await Item.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getItems,
  getRecentItems,
  searchItems,
  getItem,
  createItem,
  updateItem,
  markAsDelivered,
  deleteItem
};