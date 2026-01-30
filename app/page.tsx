'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useCharacter } from '@/contexts/CharacterContext';
import './homepage.css';

export default function Home() {
  const { authState } = useAuth();
  const { character } = useCharacter();
  const router = useRouter();
  const isAuthenticated = authState.isAuthenticated;
  const username = authState.user?.username || 'User';
  const [basicsDropdownOpen, setBasicsDropdownOpen] = useState(false);

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
        fontSize: '1.2rem'
      }}>
        Loading CodeKingdom...
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="homepage-container">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">
              The free, fun, and effective way to learn coding! 🚀
            </h1>
            <p className="hero-subtitle">
              Master Python, HTML, CSS, and more through interactive games and adventures!
            </p>
            <div className="hero-buttons">
              <Link href="/adventure" className="btn-primary">
                START PLAYING
              </Link>
              <Link href="/character" className="btn-secondary">
                CUSTOMIZE CHARACTER
              </Link>
            </div>
            
            {character && (
              <div className="hero-stats">
                <div className="stat-badge">
                  <span className="stat-icon">🪙</span>
                  <span className="stat-value">{character.coins || 0}</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">Level {character.level || 1}</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-icon">📊</span>
                  <span className="stat-value">{character.points || 0} Points</span>
                </div>
              </div>
            )}
          </div>
          <div className="hero-illustration">
            {/* Basics Dropdown - Important for new users - Right side */}
            <div className="basics-dropdown-container-right">
              <div className="basics-header-right">
                <span className="basics-icon">📚</span>
                <span className="basics-text">New to coding? Start here!</span>
              </div>
              <div className="basics-dropdown-wrapper">
                <button 
                  className="basics-dropdown-btn-prominent"
                  onClick={() => setBasicsDropdownOpen(!basicsDropdownOpen)}
                  onBlur={() => setTimeout(() => setBasicsDropdownOpen(false), 200)}
                >
                  <span>Learn the Basics</span>
                  <span className="dropdown-arrow">{basicsDropdownOpen ? '▲' : '▼'}</span>
                </button>
                {basicsDropdownOpen && (
                  <div className="basics-dropdown-menu">
                    <Link href="/python-basics" className="basics-dropdown-item" onClick={() => setBasicsDropdownOpen(false)}>
                      <span className="basics-item-icon">🐍</span>
                      <div className="basics-item-content">
                        <div className="basics-item-title">Python Basics</div>
                        <div className="basics-item-desc">Learn Python fundamentals</div>
                      </div>
                    </Link>
                    <Link href="/html-css-basics" className="basics-dropdown-item" onClick={() => setBasicsDropdownOpen(false)}>
                      <span className="basics-item-icon">🌐</span>
                      <div className="basics-item-content">
                        <div className="basics-item-title">HTML & CSS Basics</div>
                        <div className="basics-item-desc">Master web development</div>
                      </div>
                    </Link>
                    <Link href="/3d-basics" className="basics-dropdown-item" onClick={() => setBasicsDropdownOpen(false)}>
                      <span className="basics-item-icon">🧱</span>
                      <div className="basics-item-content">
                        <div className="basics-item-title">3D Basics</div>
                        <div className="basics-item-desc">Learn 3D coordinates and building</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="character-cluster">
              <div className="floating-character" style={{ top: '5%', left: '10%', animationDelay: '0s' }}>
                🧑‍💻
              </div>
              <div className="floating-character" style={{ top: '10%', right: '15%', animationDelay: '0.5s' }}>
                👩‍💻
              </div>
              <div className="floating-character main-character" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '1s' }}>
                🎮
              </div>
              <div className="floating-character" style={{ bottom: '35%', left: '20%', animationDelay: '1.5s' }}>
                🐍
              </div>
              <div className="floating-character" style={{ bottom: '40%', right: '10%', animationDelay: '2s' }}>
                🌐
              </div>
              <div className="floating-character" style={{ top: '25%', left: '5%', animationDelay: '2.5s' }}>
                ⚡
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <h2 className="section-title">🎮 Play & Learn</h2>
        <p className="section-subtitle">Choose your adventure and start coding!</p>
        <div className="games-grid">
          <Link href="/adventure" className="game-card adventure-card">
            <div className="game-icon">🎯</div>
            <h3 className="game-title">Adventure Game</h3>
            <p className="game-description">Navigate through mazes, collect diamonds, and learn programming logic!</p>
            <div className="game-badge">Grid-Based</div>
          </Link>
          
          <Link href="/web-dev-game" className="game-card webdev-card">
            <div className="game-icon">🌐</div>
            <h3 className="game-title">Web Dev Game</h3>
            <p className="game-description">Build websites with HTML & CSS. See your code come to life instantly!</p>
            <div className="game-badge">HTML/CSS</div>
          </Link>
          
          <Link href="/story-game" className="game-card story-card">
            <div className="game-icon">🐍</div>
            <h3 className="game-title">Python Story Adventure</h3>
            <p className="game-description">Write real Python code to explore worlds, solve puzzles, and complete quests!</p>
            <div className="game-badge">Python</div>
          </Link>
          
          <Link href="/block-builder" className="game-card blockbuilder-card">
            <div className="game-icon">🧱</div>
            <h3 className="game-title">3D Block Builder</h3>
            <p className="game-description">Build amazing 3D structures with Python commands! Create towers, walls, and more!</p>
            <div className="game-badge">3D Building</div>
          </Link>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="features-section">
        <h2 className="section-title">What You'll Learn</h2>
        <div className="features-carousel">
          <div className="feature-item">
            <div className="feature-icon">🐍</div>
            <div className="feature-name">PYTHON</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌐</div>
            <div className="feature-name">HTML</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <div className="feature-name">CSS</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-name">LOGIC</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-name">PROBLEM SOLVING</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <div className="feature-name">CREATIVITY</div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="quick-links-section">
        <div className="quick-links-grid">
          <Link href="/character" className="quick-link-card">
            <div className="quick-link-icon">👤</div>
            <h3>My Character</h3>
            <p>Customize your coding buddy</p>
          </Link>
          
          <Link href="/shop" className="quick-link-card">
            <div className="quick-link-icon">🛒</div>
            <h3>Shop</h3>
            <p>Buy pets and accessories</p>
          </Link>
          
          <Link href="/python-basics" className="quick-link-card">
            <div className="quick-link-icon">📚</div>
            <h3>Python Basics</h3>
            <p>Learn Python fundamentals</p>
          </Link>
          
          <Link href="/html-css-basics" className="quick-link-card">
            <div className="quick-link-icon">📖</div>
            <h3>HTML & CSS Basics</h3>
            <p>Master web development</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
