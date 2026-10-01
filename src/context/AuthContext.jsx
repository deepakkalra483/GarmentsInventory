import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, getDocs, collection,
  updateDoc, serverTimestamp, query, where,
} from 'firebase/firestore';
import { initializeApp, deleteApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../firebase/firebase';

const AuthContext = createContext(null);

// Default permissions for a new staff member
export const DEFAULT_PERMS = {
  sales: true,
  returns: false,
  purchase: false,
  inventory: false,
  reports: false,
  discount: false,
  viewAllBills: false,
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // full profile from Firestore
  const [users, setUsers]             = useState([]);   // all staff (for dropdowns)
  const [loading, setLoading]         = useState(true);

  // ── Watch Firebase auth state ──────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Load all users (staff list) ────────────────────────────────────────────
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => d.data()));
    } catch (e) {
      console.error('loadUsers error', e);
    }
  };

  // ── Fetch single user profile from Firestore ───────────────────────────────
  const fetchProfile = async (uid) => {
    const ref  = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const cred    = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(cred.user.uid);
      if (!profile) throw new Error('User profile not found in database.');
      setCurrentUser(profile);
      return { success: true };
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Wrong email or password — try again.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Try again later.'
          : err.message || 'Login failed.';
      return { success: false, error: msg };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // ── Admin: create a new staff account ─────────────────────────────────────
  // Uses a secondary Firebase app so the admin stays signed in
  const createStaffUser = async ({ name, email, password, permissions = DEFAULT_PERMS }) => {
    // Avoid duplicate secondary app
    const secondaryAppName = 'SecondaryForCreation';
    const existing = getApps().find(a => a.name === secondaryAppName);
    if (existing) await deleteApp(existing);

    const secondaryApp  = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid  = cred.user.uid;

      const initials = name
        .split(' ')
        .map(w => w[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const profile = {
        uid,
        name,
        email,
        role: 'staff',
        initials,
        permissions,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      // Refresh users list
      await loadUsers();
      return { success: true, uid };
    } catch (err) {
      await deleteApp(secondaryApp).catch(() => {});
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : err.message || 'Failed to create account.';
      return { success: false, error: msg };
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isAdmin = () => currentUser?.role === 'admin';

  const hasPerm = (key) => {
    if (!currentUser) return false;
    if (isAdmin()) return true;
    return currentUser.permissions?.[key] ?? false;
  };

  const getUserPerms = (uid) => {
    const u = users.find(u => u.uid === uid);
    return u?.permissions ?? DEFAULT_PERMS;
  };

  // Save updated permissions to Firestore and refresh local user list
  const updatePerms = async (uid, newPerms) => {
    await updateDoc(doc(db, 'users', uid), { permissions: newPerms });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, permissions: newPerms } : u));
    // If updating current logged-in user, refresh their session
    if (currentUser?.uid === uid) {
      setCurrentUser(prev => ({ ...prev, permissions: newPerms }));
    }
  };

  // ── Seed the admin account on first run ───────────────────────────────────
  // Call this from LoginPage when admin logs in for first time
  const seedAdminProfile = async (firebaseUser) => {
    const ref  = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         firebaseUser.uid,
        name:        'Mani',
        email:       firebaseUser.email,
        role:        'admin',
        initials:    'MA',
        permissions: {},
        createdAt:   serverTimestamp(),
      });
    }
    const profile = await fetchProfile(firebaseUser.uid);
    setCurrentUser(profile);
    loadUsers();
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="ti ti-shirt" style={{ fontSize: 40, color: 'var(--accent)' }} />
          <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text2)' }}>Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login, logout,
      isAdmin, hasPerm,
      getUserPerms, updatePerms,
      createStaffUser,
      seedAdminProfile,
      loadUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
