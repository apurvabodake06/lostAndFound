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

  const items = await Item.searchItems(q);
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
  // Add user to req.body
  req.body.addedBy = req.user.id;

  // Handle file upload
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  const item = await Item.create({
    ...req.body,
    image: `/uploads/${req.file.filename}`
  });

  res.status(201).json({
    success: true,
    data: item
  });
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

  // Make sure user is guard/admin
  if (req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
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

  // Make sure user is guard/admin
  if (req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this item'
    });
  }

  item = await Item.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'delivered',
      claimedBy: req.body.claimedBy 
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

  // Make sure user is guard/admin
  if (req.user.role !== 'guard') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to delete this item'
    });
  }

  // Delete image file
  const imagePath = path.join(__dirname, '../public', item.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await item.remove();

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