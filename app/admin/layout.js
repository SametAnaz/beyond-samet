'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthGuard from './components/AuthGuard';
import './admin.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only check login path on client-side to avoid hydration issues
  const isLoginPage = isClient && pathname === '/admin/login';
  
  // During server-side rendering or hydration, render children directly
  if (!isClient) {
    return <>{children}</>;
  }
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
} 