import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 font-semibold' : 'text-secondary-700 hover:text-primary-600';
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
  <img
    className="h-10 w-auto"
    src="/pict_logo.jpeg"
    alt="PICT Logo"
  />


                <span className="ml-3 text-xl font-bold text-secondary-900">Lost & Found - PICT College</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                Home
              </Link>
              <Link to="/lost-items" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/lost-items')}`}>
                Lost Items
              </Link>
              <Link to="/about" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/about')}`}>
                About Us
              </Link>
              <Link to="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/contact')}`}>
                Contact Us
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Guard Login
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'}`}
          >
            Home
          </Link>
          <Link
            to="/lost-items"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/lost-items') ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'}`}
          >
            Lost Items
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about') ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'}`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/contact') ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'}`}
          >
            Contact Us
          </Link>
          
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-600'}`}
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Guard Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;