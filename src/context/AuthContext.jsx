import React, { createContext, useContext, useState } from 'react';

export const USERS = {
  admin: { id: 'admin', name: 'Mani', role: 'admin', pin: '1234', initials: 'MA', bg: '#EFF6FF', fg: '#1D4ED8' },
  raju:  { id: 'raju',  name: 'Raju Kumar',   role: 'sales', pin: '1111', initials: 'RK', bg: '#EFF6FF', fg: '#1D4ED8' },
  sunita:{ id: 'sunita',name: 'Sunita Devi',   role: 'sales', pin: '2222', initials: 'SD', bg: '#FDF2F8', fg: '#9D174D' },
  deepak:{ id: 'deepak',name: 'Deepak Meena',  role: 'sales', pin: '3333', initials: 'DM', bg: '#F0FDF4', fg: '#15803D' },
};

export const INITIAL_PERMS = {
  raju:  { sales: true,  returns: true,  purchase: false, inventory: false, reports: false, discount: false, viewAllBills: false },
  sunita:{ sales: true,  returns: false, purchase: false, inventory: false, reports: false, discount: false, viewAllBills: false },
  deepak:{ sales: true,  returns: true,  purchase: true,  inventory: false, reports: false, discount: true,  viewAllBills: false },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [perms, setPerms] = useState(INITIAL_PERMS);

  const login = (userId, pin) => {
    const user = USERS[userId];
    if (!user) return { success: false, error: 'Select your account' };
    if (user.pin !== pin) return { success: false, error: 'Wrong PIN — try again' };
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const isAdmin = () => currentUser?.role === 'admin';

  const hasPerm = (key) => {
    if (!currentUser) return false;
    if (isAdmin()) return true;
    return perms[currentUser.id]?.[key] ?? false;
  };

  const getUserPerms = (userId) => perms[userId] ?? {};

  const updatePerms = (userId, newPerms) => {
    setPerms(prev => ({ ...prev, [userId]: { ...prev[userId], ...newPerms } }));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, hasPerm, getUserPerms, updatePerms, perms }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
