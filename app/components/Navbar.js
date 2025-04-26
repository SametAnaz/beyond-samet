'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Beyond Samet
        </Link>

        <div className={styles.rightSection}>
          <button 
            className={styles.menuButton} 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburger}></span>
          </button>
        </div>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
          <li>
            <Link 
              href="/" 
              className={isActive('/') ? styles.active : ''}
              onClick={() => setMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
          </li>
          <li>
            <Link 
              href="/blog" 
              className={isActive('/blog') ? styles.active : ''} 
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link 
              href="/about" 
              className={isActive('/about') ? styles.active : ''} 
              onClick={() => setMenuOpen(false)}
            >
              Hakkımda
            </Link>
          </li>
          <li>
            <Link 
              href="/gallery" 
              className={isActive('/gallery') ? styles.active : ''} 
              onClick={() => setMenuOpen(false)}
            >
              Galeri
            </Link>
          </li>
          <li>
            <Link 
              href="/contact" 
              className={isActive('/contact') ? styles.active : ''} 
              onClick={() => setMenuOpen(false)}
            >
              İletişim
            </Link>
          </li>
          <li className={styles.themeToggleItem}>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
} 