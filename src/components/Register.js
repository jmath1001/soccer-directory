import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const Register = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscription, setSubscription] = useState('basic');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);

      // Save extra info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        fieldClaimed: false,
        subscriptionPlan: subscription,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
      setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Subscription Plan:</label>
          <select
            value={subscription}
            onChange={(e) => setSubscription(e.target.value)}
            required
          >
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
