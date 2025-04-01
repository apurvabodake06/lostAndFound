const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics',
      'Clothing',
      'Study Material',
      'Accessories',
      'ID Cards',
      'Keys',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Please select a location'],
    enum: [
      'Main Building',
      'Canteen Area',
      'Library',
      'Computer Lab',
      'Auditorium',
      'Sports Field',
      'Parking Lot',
      'Other'
    ]
  },
  foundDate: {
    type: Date,
    required: [true, 'Please add a found date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'delivered'],
    default: 'available'
  },
  image: {
    type: String,
    required: [true, 'Please upload an image']
  },
  claimedBy: {
    studentName: String,
    rollNumber: String,
    studyYear: String,
    contactNumber: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate items
ItemSchema.index({ name: 1, foundDate: 1, location: 1 }, { unique: true });

// Static method to get items by status
ItemSchema.statics.getItemsByStatus = async function(status) {
  return await this.find({ status });
};

// Static method to search items
ItemSchema.statics.searchItems = async function(searchTerm) {
  return await this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('Item', ItemSchema);