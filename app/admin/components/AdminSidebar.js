'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/posts', icon: '📝', label: 'Blog Yazıları' },
    { href: '/admin/comments', icon: '💬', label: 'Yorumlar' },
    { href: '/admin/gallery', icon: '🖼️', label: 'Galeri' },
  ];

  return (
    <div className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
      <div className="admin-brand">
        <div className="admin-brand-logo">
          <div className="admin-brand-icon">B</div>
          <h1>Beyond Admin</h1>
        </div>
        <button className="admin-mobile-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>
      <ul className="admin-nav">
        <div className="admin-nav-section">Ana Menü</div>
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className={pathname === item.href ? 'active' : ''}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
