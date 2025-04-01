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
    return response.data.data; // Adjust based on your API response
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
    return response.data;
  } catch (error) {
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
    const response = await axios.put(`${API_URL}/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Update item status (claimed/delivered)
const updateItemStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Mark item as claimed/delivered
const claimItem = async (id, claimData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/claim`, claimData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
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