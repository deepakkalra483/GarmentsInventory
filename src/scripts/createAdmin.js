/**
 * ─────────────────────────────────────────────────────────
 *  ONE-TIME ADMIN ACCOUNT CREATOR
 *  Usage:
 *    1. Fill in ADMIN_EMAIL and ADMIN_PASSWORD below
 *    2. Open your app in browser (localhost:3000)
 *    3. Open browser console (F12 → Console tab)
 *    4. Type:  createAdmin()   and press Enter
 *    5. Done! Now delete this file or comment out the call.
 * ─────────────────────────────────────────────────────────
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

// ── ✏️  FILL THESE IN ──────────────────────────────────────
const ADMIN_EMAIL = 'test@gmail.com'; // change this
const ADMIN_PASSWORD = 'test123';             // change this (min 6 chars)
const ADMIN_NAME = 'Deepak';                   // admin display name
// ──────────────────────────────────────────────────────────

export async function createAdmin() {
  try {
    console.log('⏳ Creating admin account…');

    // 1. Create the Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = cred.user.uid;

    // 2. Save admin profile to Firestore /users/{uid}
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      initials: ADMIN_NAME.slice(0, 2).toUpperCase(),
      permissions: {},
      createdAt: serverTimestamp(),
    });

    console.log('✅ Admin account created successfully!');
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
    console.log(`   UID      : ${uid}`);
    console.log('   Now sign in to the app with these credentials.');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.warn('⚠️  An account with this email already exists in Firebase Auth.');
      console.warn('   If you forgot your password, reset it from Firebase Console.');
    } else {
      console.error('❌ Failed to create admin:', err.message);
    }
  }
}

// Make callable from browser console
// window.createAdmin = createAdmin;
