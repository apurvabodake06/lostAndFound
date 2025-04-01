import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  // Function to determine the status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-48 bg-gray-200">
        <img
          src={item.imageUrl || '/assets/images/placeholder.png'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
            {item.status === 'available' ? 'Available' : 
             item.status === 'claimed' ? 'Claimed' : 
             item.status === 'delivered' ? 'Delivered' : 'Processing'}
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className="text-white text-sm font-medium px-2 py-1 rounded bg-primary-600">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-secondary-900 mb-1 truncate">{item.name}</h3>
        <p className="text-sm text-secondary-500 mb-2">Found on {formatDate(item.foundDate)}</p>
        <p className="text-sm text-secondary-700 line-clamp-2 mb-4">{item.description}</p>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-secondary-500">
            <span className="font-medium">Location:</span> {item.location}
          </p>
          <Link 
            to={`/item/${item._id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;