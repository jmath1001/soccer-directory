'use client';

import React from 'react';
import { supabase } from '@/lib/supabaseClient';

const Logout: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
