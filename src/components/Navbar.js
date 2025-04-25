// src/components/Navbar.js
import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="navbar">
     <ul className="nav-list">
  <li><Link href="/">Anasayfa</Link></li>
  <li><Link href="/blog">Blog</Link></li>
  <li><Link href="/about">Hakkımda</Link></li>
  <li><Link href="/contact">İletişim</Link></li>
  <li><ThemeToggle /></li>
</ul>
    </nav>
  );
}
