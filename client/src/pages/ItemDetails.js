import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaTag, FaInfoCircle, FaUser } from 'react-icons/fa';
import ClaimForm from '../components/ClaimForm';
import LoadingSpinner from '../components/LoadingSpinner'

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(decoded.role === 'admin');
        } catch (e) {
          setIsAdmin(false);
        }
      }
    };

    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
        setItem(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load item details');
        setLoading(false);
        toast.error('Failed to load item details');
      }
    };

    checkAdmin();
    fetchItemDetails();
  }, [id]);

  const handleClaim = () => {
    setShowClaimForm(true);
  };

  const handleCloseForm = () => {
    setShowClaimForm(false);
  };

  const handleMarkAsDelivered = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/items/${id}/delivered`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setItem((prevItem) => ({
        ...prevItem,
        status: 'delivered',
      }));
      
      toast.success('Item marked as delivered successfully');
    } catch (err) {
      toast.error('Failed to mark item as delivered');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/items')}
            className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/items')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Lost Items
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="h-80 bg-gray-200 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
              item.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : item.status === 'claimed' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h1>
            
            <div className="mb-6">
              <div className="flex items-center text-gray-600 mb-2">
                <FaTag className="mr-2" />
                <span>Category: </span>
                <span className="font-medium ml-1">{item.category}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <FaCalendarAlt className="mr-2" />
                <span>Found on: </span>
                <span className="font-medium ml-1">{formatDate(item.foundDate)}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>Location: </span>
                <span className="font-medium ml-1">{item.location}</span>
              </div>
              
              {item.claimedBy && (
                <div className="flex items-center text-gray-600 mb-2">
                  <FaUser className="mr-2" />
                  <span>Claimed by: </span>
                  <span className="font-medium ml-1">{item.claimedBy.name} ({item.claimedBy.rollNumber})</span>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="flex items-center text-gray-700 font-semibold mb-2">
                <FaInfoCircle className="mr-2" />
                Description
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            
            {item.status === 'available' && !isAdmin && (
              <button
                onClick={handleClaim}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Claim This Item
              </button>
            )}
            
            {item.status === 'claimed' && isAdmin && (
              <button
                onClick={handleMarkAsDelivered}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Mark as Delivered
              </button>
            )}
            
            {item.status === 'delivered' && (
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <p className="text-gray-600">This item has been delivered to its owner.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showClaimForm && (
        <ClaimForm 
          itemId={id} 
          onClose={handleCloseForm} 
          onSuccess={() => {
            setItem((prevItem) => ({
              ...prevItem,
              status: 'claimed',
            }));
          }}
        />
      )}
    </div>
  );
};

export default ItemDetails;