'use client';
import { usePathname } from 'next/navigation';
import AuthGuard from './components/AuthGuard';
import './admin.css';
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  return pathname === '/admin/login' ? children : <AuthGuard>{children}</AuthGuard>;
}
