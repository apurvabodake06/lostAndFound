// import React, { createContext, useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { login, logout } from '../services/authService';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
    
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const currentTime = Date.now() / 1000;
        
//         if (decoded.exp < currentTime) {
//           // Token expired
//           handleLogout();
//         } else {
//           setUser(decoded);
//         }
//       } catch (error) {
//         console.error('Invalid token', error);
//         handleLogout();
//       }
//     }
    
//     setLoading(false);
//   }, []);

//   const handleLogin = async (email, password) => {
//     try {
//       const data = await login(email, password);
      
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         const decoded = jwtDecode(data.token);
//         setUser(decoded);
//         return { success: true };
//       }
//     } catch (error) {
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Login failed' 
//       };
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         user, 
//         loading, 
//         login: handleLogin, 
//         logout: handleLogout,
//         isAuthenticated: !!user
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function to be used by Login component
  const login = useCallback((username, password) => {
    return new Promise((resolve, reject) => {
      // Replace with your actual API call
      if (username === "pict_guard" && password === "secure@guard123") {
        const userData = {
          username: "pict_guard",
          role: "security",
          token: "generated-jwt-token" // In real app, get this from your backend
        };
        localStorage.setItem('token', userData.token);
        setUser(userData);
        resolve(userData);
      } else {
        reject(new Error("Invalid credentials"));
      }
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('token');
  }, []);

  const isSecurityGuard = useCallback(() => {
    return user?.role === 'security';
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend in real app
      setUser({
        username: "pict_guard",
        role: "security"
      });
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isSecurityGuard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
