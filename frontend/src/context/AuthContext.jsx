import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const SYSTEM_YEAR = 2026;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('btech_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Set default authorization header helper
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  // Load notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/calendar/notifications', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token, getAuthHeaders]);

  // Sync active user session on boot — validates against backend to prevent stale role cache
  useEffect(() => {
    const syncSession = async () => {
      const cached = localStorage.getItem('btech_user');
      if (cached && token) {
        // Optimistically set from cache first for instant UI
        setUser(JSON.parse(cached));
        try {
          // Then validate against backend to get fresh role/user data
          const res = await fetch('/api/auth/me', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              // Update both state and cache with fresh data from DB
              setUser(data.user);
              localStorage.setItem('btech_user', JSON.stringify(data.user));
            } else {
              // Token is invalid — clear session
              localStorage.removeItem('btech_token');
              localStorage.removeItem('btech_user');
              setToken(null);
              setUser(null);
            }
          }
          // If server unreachable (network error), cached user stays — handled by catch
        } catch (err) {
          console.warn('Session validation skipped (server unreachable), using cache:', err.message);
        }
        await fetchNotifications();
      }
      setLoading(false);
    };
    syncSession();
  }, [token, fetchNotifications]);


  // Dynamic parse-arithmetic helper for student registration verification
  const checkRollNumberStatus = (rollNo) => {
    const regex = /^[0-9]{2}[0-9A-Z]{8}$/;
    if (!regex.test(rollNo.toUpperCase())) {
      return { valid: false, error: 'Invalid Roll Number structure. Expected: YY481AXXNN' };
    }

    const cleanRoll = rollNo.toUpperCase();
    const prefix = parseInt(cleanRoll.substring(0, 2), 10);
    const admissionYear = 2000 + prefix;
    const graduationYear = admissionYear + 4;

    if (SYSTEM_YEAR >= graduationYear) {
      return {
        valid: false,
        error: `Access Expired! You graduated in ${graduationYear}. BTech student access is restricted to 4 active years.`
      };
    }

    const pursuingYear = SYSTEM_YEAR - admissionYear + 1;
    return {
      valid: true,
      admissionYear,
      graduationYear,
      pursuingYear
    };
  };

  // Login Handler (Students & Staff)
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Perform client-side check first if it's a student roll number
      if (credentials.rollNo) {
        const check = checkRollNumberStatus(credentials.rollNo);
        if (!check.valid) {
          toast.error(check.error);
          setLoading(false);
          return false;
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Login failed.');
        setLoading(false);
        return false;
      }

      // Cache token and user details
      localStorage.setItem('btech_token', data.token);
      localStorage.setItem('btech_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Fetch initial notifications
      setTimeout(() => fetchNotifications(), 500);

      setLoading(false);
      return true;

    } catch (err) {
      toast.error('Network Error: Express Server is offline.');
      setLoading(false);
      return false;
    }
  };

  // Register Handler (Student Only)
  const register = async (studentDetails) => {
    try {
      setLoading(true);

      // Perform graduation lockout checks
      const check = checkRollNumberStatus(studentDetails.rollNo);
      if (!check.valid) {
        toast.error(check.error);
        setLoading(false);
        return false;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentDetails)
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Registration failed.');
        setLoading(false);
        return false;
      }

      localStorage.setItem('btech_token', data.token);
      localStorage.setItem('btech_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      toast.success('Registration completed successfully! Welcome to the Hub.');
      setLoading(false);
      return true;

    } catch (err) {
      toast.error('Server offline. Cannot complete registration.');
      setLoading(false);
      return false;
    }
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('btech_token');
    localStorage.removeItem('btech_user');
    setToken(null);
    setUser(null);
    setNotifications([]);
    toast.success('Logged out successfully.');
  };

  // Toggle Read Notifications
  const markAsRead = async (notifyId) => {
    try {
      const res = await fetch(`/api/calendar/notifications/${notifyId}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n._id === notifyId ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      notifications,
      getAuthHeaders,
      login,
      register,
      logout,
      fetchNotifications,
      markAsRead,
      checkRollNumberStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
