//AuthContext :
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Make sure axios is imported!
import { API_BASE_URL } from '../../app/config/config';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // config.js

  // Load token on startup
  useEffect(() => {
    const loadToken = async () => {
      try {
        // Log stored tokens before using them
        const [token, refresh] = await AsyncStorage.multiGet([
          'authToken',
          'refreshToken'
        ]);

        if (token[1]) {
          // Log the token and the API URL that will be used
          const response = await axios.get(`${API_BASE_URL}/account/me/`, {
            headers: { Authorization: `Bearer ${token[1]}` }
          });

          setUser({
            username: response.data.username,
            token: token[1],
            refreshToken: refresh[1],
            userId: response.data.id,
            isAuthenticated: true
          });
        } else {
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (userData) => {
    try {
      await AsyncStorage.multiSet([
        ['authToken', userData.access],
        ['refreshToken', userData.refresh]
      ]);

      setUser({ 
        username: userData.username,
        token: userData.access,
        refreshToken: userData.refresh,
        userId: userData.user_id,
        isAuthenticated: true 
      });
    } catch (err) {
      setError('Failed to save session');
      console.error('Login error:', err);
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = await AsyncStorage.getItem('refreshToken');
      const response = await axios.post(`${API_BASE_URL}/account/token/refresh/`, {
        refresh: refresh
      });
      
      await AsyncStorage.setItem('authToken', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      throw error;
    }
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        error,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
