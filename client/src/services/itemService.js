import axios from 'axios';
import authService from './authService';
const API_URL ='http://localhost:5000/api/items'; ;

// Set auth token for every request
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all items
const getAllItems = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log('API Response:', response.data);
    
    // Check response format and handle accordingly
    if (response.data && response.data.data) {
      return response.data.data; // Standard format returned by our API
    } else if (Array.isArray(response.data)) {
      return response.data; // Direct array of items
    } else {
      console.error('Unexpected API response format:', response.data);
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};


// Alias for getAllItems to match import in LostItems.js
const getItems = getAllItems;

// Get items by category
const getItemsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Get recent items (for homepage)
const getRecentItems = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_URL}/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Search items
const searchItems = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search?q=${query}`);
    
    // Check response format and handle accordingly
    if (response.data && response.data.data) {
      return response.data.data; // Standard format returned by our API
    } else if (Array.isArray(response.data)) {
      return response.data; // Direct array of items
    } else {
      console.error('Unexpected API response format:', response.data);
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error searching items:', error);
    throw error.response?.data || { message: 'Server error' };
  }
};

// Get item by ID
const getItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Add new item (security guard only)
// const addItem = async (itemData) => {
//   try {
//     // Create FormData for file upload
//     const formData = new FormData();
    
//     // Append item image
//     if (itemData.image) {
//       formData.append('image', itemData.image);
//     }
    
//     // Append other item data
//     formData.append('name', itemData.name);
//     formData.append('category', itemData.category);
//     formData.append('description', itemData.description);
//     formData.append('location', itemData.location);
//     formData.append('foundDate', itemData.foundDate);
    
//     const response = await axios.post(API_URL, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
    
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || { message: 'Server error' };
//   }
// };

const addItem = async (itemData) => {
  try {
    const token = authService.getToken(); // Get token
    if (!token) {
      throw new Error("Authentication token missing");
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Append item image
    if (itemData.image) {
      formData.append('image', itemData.image);
    }
    
    // Append other item data
    formData.append('name', itemData.name);
    formData.append('category', itemData.category);
    formData.append('description', itemData.description);
    formData.append('location', itemData.location);
    formData.append('foundDate', itemData.foundDate);
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` // Ensure token is sent
      }
    });

    return response.data;
  } catch (error) {
    console.error("Add Item Error:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Server error' };
  }
};


// Update item
const updateItem = async (id, itemData) => {
  try {
    // Check if itemData is FormData (has image) or regular object
    const isFormData = itemData instanceof FormData;
    
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios.put(`${API_URL}/${id}`, itemData, { 
      headers 
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error.response?.data || { message: 'Server error' };
  }
};

// Update item status (claimed/delivered)
const updateItemStatus = async (id, statusData) => {
  try {
    // For marking items as delivered, preserve claimed information
    const method = statusData.status === 'delivered' ? 'put' : 'patch';
    const endpoint = statusData.status === 'delivered' ? `${API_URL}/${id}/delivered` : `${API_URL}/${id}/status`;
    
    const response = await axios[method](endpoint, statusData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating item status:", error);
    throw error.response?.data || { message: 'Server error' };
  }
};

// Mark item as claimed/delivered
const claimItem = async (id, claimData) => {
  try {
    const url = `${API_URL}/${id}/claim`;
    console.log("Claiming item:", id);
    
    const response = await axios.put(url, claimData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error claiming item:", error);
    // Provide more detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to claim item. Please try again.';
    throw { message: errorMessage };
  }
};

// Delete item
const deleteItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Export individual functions for direct importing
export {
  getAllItems,
  getItems,
  getItemsByCategory,
  getRecentItems,
  searchItems,
  getItemById,
  addItem,
  updateItem,
  updateItemStatus,
  claimItem,
  deleteItem
};

// Default export for backward compatibility
const itemService = {
  getAllItems,
  getItems,
  getItemsByCategory,
  getRecentItems,
  searchItems,
  getItemById,
  addItem,
  updateItem,
  updateItemStatus,
  claimItem,
  deleteItem
};

export default itemService;