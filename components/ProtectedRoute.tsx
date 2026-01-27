'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.loading && !authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState, router]);

  if (authState.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#3498db'
      }}>
        Loading CodeKingdom...
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
