'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          router.replace('/admin/login');
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        router.replace('/admin/login');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } finally {
      router.replace('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>
      
      {children}
      
      <style jsx>{`
        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid var(--accent-color);
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .admin-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .admin-header {
          display: flex;
          justify-content: flex-end;
          padding: 1rem;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
        }
        
        .logout-button {
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .logout-button:hover {
          background-color: rgba(229, 62, 62, 0.1);
          border-color: #e53e3e;
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
