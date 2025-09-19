import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check for existing user session
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token with backend
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.user);
              localStorage.setItem('userData', JSON.stringify(data.user));
            }
          } else {
            // Token is invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        return { success: true, user: data.user, profile: data.profile };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (firstName, lastName, email, password) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Notify backend about logout
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local storage and state regardless of backend response
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    getAuthToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};