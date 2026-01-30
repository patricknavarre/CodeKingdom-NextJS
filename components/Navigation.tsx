'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import './Navigation.css';

export default function Navigation() {
  const { authState, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isAuthenticated = authState.isAuthenticated;
  const username = authState.user?.username || 'User';
  
  // Check if we're on a game page
  const gamePages = ['/adventure', '/story-game', '/web-dev-game', '/block-builder'];
  const isGamePage = gamePages.includes(pathname);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div 
      className={`navigation-wrapper ${isGamePage ? 'game-page' : ''}`}
      onMouseEnter={() => isGamePage && setIsHovering(true)}
      onMouseLeave={() => isGamePage && setIsHovering(false)}
    >
      <header className={`navigation-header ${isGamePage ? (isHovering ? 'show' : 'hide') : ''}`}>
        <div className="nav-container">
        <Link href="/" className="nav-brand" onClick={closeMenu}>
          <span className="nav-brand-icon">👑</span>
          <span>CodeKingdom</span>
        </Link>
        
        <button
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span>Menu</span>
          <span className="nav-toggle-icon">{menuOpen ? '▲' : '▼'}</span>
        </button>
      </div>
      
      <nav className={`nav-dropdown ${menuOpen ? 'open' : ''}`}>
        <Link 
          href="/" 
          onClick={closeMenu} 
          className="nav-link home"
        >
          🏠 Home
        </Link>
        
        <Link 
          href="/character" 
          onClick={closeMenu} 
          className="nav-link character"
        >
          👤 My Character
        </Link>
        
        {/* Games Section */}
        <div className="nav-section-header">
          🎮 Games
        </div>
        <Link 
          href="/adventure" 
          onClick={closeMenu} 
          className="nav-link adventure nav-sub-link"
        >
          🎯 Code Grid Adventure
        </Link>
        <Link 
          href="/web-dev-game" 
          onClick={closeMenu} 
          className="nav-link webdev nav-sub-link"
        >
          🌐 Web Dev Game
        </Link>
        <Link 
          href="/story-game" 
          onClick={closeMenu} 
          className="nav-link story nav-sub-link"
        >
          🐍 Python Story Adventure
        </Link>
        <Link 
          href="/block-builder" 
          onClick={closeMenu} 
          className="nav-link blockbuilder nav-sub-link"
        >
          🧱 3D Block Builder
        </Link>
        
        {/* Basics Section */}
        <div className="nav-section-header">
          📚 Basics
        </div>
        <Link 
          href="/python-basics" 
          onClick={closeMenu} 
          className="nav-link python nav-sub-link"
        >
          🐍 Python Basics
        </Link>
        <Link 
          href="/html-css-basics" 
          onClick={closeMenu} 
          className="nav-link htmlcss nav-sub-link"
        >
          🌐 HTML & CSS Basics
        </Link>
        <Link 
          href="/3d-basics" 
          onClick={closeMenu} 
          className="nav-link threed nav-sub-link"
        >
          🧱 3D Basics
        </Link>
        
        <Link 
          href="/shop" 
          onClick={closeMenu} 
          className="nav-link shop"
        >
          🛒 Shop
        </Link>
        
        {isAuthenticated ? (
          <>
            <div className="nav-user-info">
              <span className="nav-user-icon">👋</span>
              <span>Welcome, {username}!</span>
            </div>
            <button
              onClick={handleLogout}
              className="nav-logout-btn"
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <div className="nav-auth-links">
            <Link 
              href="/login" 
              onClick={closeMenu} 
              className="nav-auth-link login"
            >
              🔐 Login
            </Link>
            <Link 
              href="/register" 
              onClick={closeMenu} 
              className="nav-auth-link signup"
            >
              ✨ Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
    </div>
  );
}
