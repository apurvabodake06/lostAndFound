import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCamera, FaUpload, FaCheckCircle, FaTrash } from 'react-icons/fa';

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    foundDate: new Date().toISOString().slice(0, 10),
    status: 'available'
  });
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Categories for lost items
  const categories = [
    'Electronics',
    'Clothing',
    'Study Material',
    'Accessories',
    'ID Cards',
    'Keys',
    'Other'
  ];

  // Campus locations
  const locations = [
    'Main Building',
    'Canteen Area',
    'Library',
    'Computer Lab',
    'Auditorium',
    'Sports Field',
    'Parking Lot',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!imageFile) {
      toast.error('Please upload an image of the item');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create form data to send the image file
      const itemFormData = new FormData();
      itemFormData.append('image', imageFile);
      itemFormData.append('name', formData.name);
      itemFormData.append('category', formData.category);
      itemFormData.append('description', formData.description);
      itemFormData.append('location', formData.location);
      itemFormData.append('foundDate', formData.foundDate);
      itemFormData.append('status', formData.status);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/items`,
        itemFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast.success('Item added successfully!');
      
      // Navigate to the dashboard or item details page after a brief delay
      setTimeout(() => {
        navigate(`/items/${response.data._id}`);
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-50 border-b">
          <h1 className="text-2xl font-bold text-blue-800">Add Lost Item</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details of the lost item that was submitted to the lost and found office.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Item Image*
            </label>
            
            {!imagePreview ? (
              <div 
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
              >
                <FaCamera className="text-gray-400 text-5xl mb-3" />
                <p className="text-gray-500 mb-2">Click to upload an image</p>
                <p className="text-gray-400 text-xs">JPG, PNG or GIF (Max 5MB)</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Item preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                Item Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Blue Backpack"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                Found Location*
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="foundDate" className="block text-gray-700 text-sm font-bold mb-2">
                Date Found*
              </label>
              <input
                type="date"
                id="foundDate"
                name="foundDate"
                value={formData.foundDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide any additional details about the item (color, brand, condition, etc.)"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Save Item
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;