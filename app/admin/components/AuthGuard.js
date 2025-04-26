'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication immediately to prevent flickering
    const checkAuth = () => {
      try {
        // Only access localStorage if in browser environment
        if (typeof window === 'undefined') return false;
        
        const authData = JSON.parse(localStorage.getItem('adminAuth') || '{"isAuthenticated": false}');
        
        // Check authentication status
        if (!authData.isAuthenticated) {
          router.replace('/admin/login');
          return false;
        }
        
        // Check session timeout (24 hours)
        const now = Date.now();
        const authTime = authData.timestamp || 0;
        const timeElapsed = now - authTime;
        const timeLimit = 24 * 60 * 60 * 1000; // 24 hours
        
        if (timeElapsed > timeLimit) {
          // Session expired, log out
          localStorage.removeItem('adminAuth');
          router.replace('/admin/login');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Authentication check error:', error);
        // Only attempt to remove if in browser environment
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminAuth');
        }
        router.replace('/admin/login');
        return false;
      }
    };

    // Add a mounted check to prevent setState after unmount
    let isMounted = true;
    
    // Only run in browser
    if (typeof window !== 'undefined') {
      const authenticated = checkAuth();
      if (isMounted) {
        setIsAuthenticated(authenticated);
        setLoading(false);
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.replace('/admin/login');
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
    return null; // Router already redirected to login page
  }

  return (
    <div className="admin-container">
      {/* Logout button */}
      <div className="admin-header">
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>
      
      {/* Main content */}
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