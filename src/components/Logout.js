// Logout.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import Firebase config

const Logout = ({ setUser }) => {
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
