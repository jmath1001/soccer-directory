'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, UserCircle } from 'lucide-react';
import { auth } from '@/firebase/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading user...</div>;
  if (error) return <div className="p-4 text-center text-red-600">Error: {error.message}</div>;

  return (
    <header className="bg-white shadow-md z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">SoccerFields</Link>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden md:flex items-center space-x-4 relative">
          <Link href="/browse" className="text-gray-600 hover:text-black text-sm">Browse</Link>
          <Link href="/field-owners" className="text-gray-600 hover:text-black text-sm">Field Owners</Link>

          {!user ? (
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
          ) : (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <UserCircle className="text-gray-700 hover:text-black" size={24} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-50">
                  <Link
                    href="/my-fields"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Fields
                  </Link>
                  <Link
                    href="/add-field"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Add Field
                  </Link>
                  <Link
                    href="/rental-field-manage"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Manage Fields
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t p-4 flex flex-col space-y-3 z-40">
          <Link href="/browse" className="text-gray-600 hover:text-black text-sm">Browse</Link>
          <Link href="/field-owners" className="text-gray-600 hover:text-black text-sm">Field Owners</Link>

          {user && (
            <>
              <Link href="/my-fields" className="text-gray-600 hover:text-black text-sm">My Fields</Link>
              <Link href="/add-field" className="text-gray-600 hover:text-black text-sm">Add Field</Link>
              <Link href="/rental-field-manage" className="text-gray-600 hover:text-black text-sm">Manage Fields</Link>
            </>
          )}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
