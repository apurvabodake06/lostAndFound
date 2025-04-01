import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { AuthContext } from '../context/AuthContext';
import { getItems, updateItemStatus, deleteItem } from '../services/itemService';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const GuardDashboard = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimFormVisible, setClaimFormVisible] = useState({});
  const [claimData, setClaimData] = useState({
    studentName: '',
    rollNumber: '',
    studyYear: '',
    contactNumber: ''
  });

  // const getItems = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/v1/items');
  
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch items');
  //     }
  
  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error fetching items:", error.message);
  //     throw error;
  //   }
  // };
  

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = items.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const toggleClaimForm = (id) => {
    setClaimFormVisible({
      ...claimFormVisible,
      [id]: !claimFormVisible[id]
    });
    setClaimData({
      studentName: '',
      rollNumber: '',
      studyYear: '',
      contactNumber: ''
    });
  };

  const handleClaimChange = (e) => {
    setClaimData({
      ...claimData,
      [e.target.name]: e.target.value
    });
  };

  const handleClaimSubmit = async (id) => {
    try {
      await updateItemStatus(id, {
        status: 'delivered',
        claimedBy: claimData
      });
      
      // Update item in local state
      setItems(items.map(item => 
        item._id === id 
          ? { ...item, status: 'delivered', claimedBy: claimData } 
          : item
      ));
      
      toggleClaimForm(id);
    } catch (err) {
      setError('Failed to update item status');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Security Guard Dashboard</h1>
        <Link 
          to="/AddItem" 
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Item
        </Link>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search items by name, category, or description..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }
          >
            All Items ({items.length})
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }
          >
            Unclaimed ({items.filter(item => item.status === 'unclaimed').length})
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }
          >
            Delivered ({items.filter(item => item.status === 'delivered').length})
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          <Tab.Panel>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Item Name</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Found Date</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <React.Fragment key={item._id}>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4">{item.category}</td>
                          <td className="py-3 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link to={`/edit-item/${item._id}`} className="text-blue-600 hover:text-blue-800">
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button 
                                onClick={() => handleDelete(item._id)} 
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                              {item.status === 'unclaimed' && (
                                <button 
                                  onClick={() => toggleClaimForm(item._id)} 
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {claimFormVisible[item._id] && (
                          <tr>
                            <td colSpan="6" className="py-4 px-6 bg-gray-50">
                              <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-medium mb-4">Mark as Delivered</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Student Name
                                    </label>
                                    <input
                                      type="text"
                                      name="studentName"
                                      value={claimData.studentName}
                                      onChange={handleClaimChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Roll Number
                                    </label>
                                    <input
                                      type="text"
                                      name="rollNumber"
                                      value={claimData.rollNumber}
                                      onChange={handleClaimChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Study Year
                                    </label>
                                    <select
                                      name="studyYear"
                                      value={claimData.studyYear}
                                      onChange={handleClaimChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                      required
                                    >
                                      <option value="">Select Year</option>
                                      <option value="First Year">First Year</option>
                                      <option value="Second Year">Second Year</option>
                                      <option value="Third Year">Third Year</option>
                                      <option value="Final Year">Final Year</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Contact Number
                                    </label>
                                    <input
                                      type="text"
                                      name="contactNumber"
                                      value={claimData.contactNumber}
                                      onChange={handleClaimChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4 space-x-2">
                                  <button
                                    onClick={() => toggleClaimForm(item._id)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleClaimSubmit(item._id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                  >
                                    Confirm Delivery
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No items found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
          
          <Tab.Panel>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Item Name</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Found Date</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.filter(item => item.status === 'unclaimed').length > 0 ? (
                    filteredItems
                      .filter(item => item.status === 'unclaimed')
                      .map(item => (
                        <React.Fragment key={item._id}>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded"
                              />
                            </td>
                            <td className="py-3 px-4 font-medium">{item.name}</td>
                            <td className="py-3 px-4">{item.category}</td>
                            <td className="py-3 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Link to={`/edit-item/${item._id}`} className="text-blue-600 hover:text-blue-800">
                                  <PencilIcon className="h-5 w-5" />
                                </Link>
                                <button 
                                  onClick={() => handleDelete(item._id)} 
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => toggleClaimForm(item._id)} 
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {claimFormVisible[item._id] && (
                            <tr>
                              <td colSpan="5" className="py-4 px-6 bg-gray-50">
                                <div className="bg-white p-4 rounded-lg shadow">
                                  <h3 className="text-lg font-medium mb-4">Mark as Delivered</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Student Name
                                      </label>
                                      <input
                                        type="text"
                                        name="studentName"
                                        value={claimData.studentName}
                                        onChange={handleClaimChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Roll Number
                                      </label>
                                      <input
                                        type="text"
                                        name="rollNumber"
                                        value={claimData.rollNumber}
                                        onChange={handleClaimChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Study Year
                                      </label>
                                      <select
                                        name="studyYear"
                                        value={claimData.studyYear}
                                        onChange={handleClaimChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                      >
                                        <option value="">Select Year</option>
                                        <option value="First Year">First Year</option>
                                        <option value="Second Year">Second Year</option>
                                        <option value="Third Year">Third Year</option>
                                        <option value="Final Year">Final Year</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number
                                      </label>
                                      <input
                                        type="text"
                                        name="contactNumber"
                                        value={claimData.contactNumber}
                                        onChange={handleClaimChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-4 space-x-2">
                                    <button
                                      onClick={() => toggleClaimForm(item._id)}
                                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleClaimSubmit(item._id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                      Confirm Delivery
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No unclaimed items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
          
          <Tab.Panel>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Item Name</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Claimed By</th>
                    <th className="py-3 px-4 text-left">Claimed Date</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.filter(item => item.status === 'delivered').length > 0 ? (
                    filteredItems
                      .filter(item => item.status === 'delivered')
                      .map(item => (
                        <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4">{item.category}</td>
                          <td className="py-3 px-4">
                            {item.claimedBy?.studentName}<br/>
                            <span className="text-xs text-gray-500">
                              {item.claimedBy?.rollNumber} ({item.claimedBy?.studyYear})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleDelete(item._id)} 
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No delivered items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default GuardDashboard;