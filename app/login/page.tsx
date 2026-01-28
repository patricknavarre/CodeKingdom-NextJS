'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PublicRoute from '@/components/PublicRoute';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      await login(email, password);
      setSuccess(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMessage = err.response?.data?.message || 
                          err.message ||
                          'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <PublicRoute>
      <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4ecdc4 100%)'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        padding: '30px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 40%, #eefcff 100%)',
        borderRadius: '18px',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.35)',
        border: '3px solid rgba(255,255,255,0.9)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: '32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            color: '#1f2937',
            textAlign: 'left',
            marginBottom: '8px',
            fontSize: '2.1rem'
          }}>
            Welcome back, Coder!
          </h1>
          <p style={{
            color: '#4b5563',
            marginBottom: '18px',
            fontSize: '1rem'
          }}>
            Sign in to continue your adventures, collect rewards, and unlock new coding powers.
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, color: '#374151', fontSize: '0.95rem', lineHeight: 1.6 }}>
            <li>Pick up where you left off in Code Grid Adventure and the 3D Block Builder</li>
            <li>Earn coins, XP, and items for your character as you complete challenges</li>
            <li>Keep building your own websites in the Web Developer Game</li>
          </ul>
        </div>
        <div style={{
          padding: '20px 24px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)'
        }}>
        <h2 style={{
          color: '#1d4ed8',
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '1.5rem'
        }}>
          Sign In to CodeKingdom
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '24px',
          fontSize: '0.95rem'
        }}>
          Enter your details to jump back into the kingdom.
        </p>

        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px',
            backgroundColor: '#efe',
            color: '#3c3',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #cfc'
          }}>
            Login successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isSubmitting ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}>
            Sign up here
          </Link>
        </p>
        </div>
      </div>
    </div>
    </PublicRoute>
  );
}
