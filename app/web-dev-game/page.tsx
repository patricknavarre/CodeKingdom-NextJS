'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/WebDevGamePage.css';

// Image paths for Next.js public folder
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const blondeBoyCharacter = '/images/characters/Boy_Character_BlondeHair.png'; // new blonde boy base
const girlHoodieCharacter = '/images/characters/Girl_Character_In_PinkHoodie.png';
const girlHoodieSneakersCharacter = '/images/characters/Girl_Character_In_PinkHoodie_WhiteSneakers.png';

interface Level {
  id: number;
  title: string;
  description: string;
  challenge: string;
  htmlTemplate: string;
  cssTemplate: string;
  requirements: {
    html?: string[];
    css?: string[];
    text?: string;
  };
  xpReward: number;
  coinsReward: number;
}

const levels: Level[] = [
  {
    id: 1,
    title: 'Welcome to HTML!',
    description: 'Create your first heading',
    challenge: 'Add an <h1> heading that says "Hello, CodeKingdom!"',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My First Website</title>
</head>
<body>
  <!-- Add your heading here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['h1'],
      text: 'Hello, CodeKingdom!'
    },
    xpReward: 25,
    coinsReward: 10
  },
  {
    id: 2,
    title: 'Add Some Style',
    description: 'Style your heading with CSS',
    challenge: 'Make your heading blue and centered',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Styled Website</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['h1', 'style'],
      css: ['color', 'text-align']
    },
    xpReward: 30,
    coinsReward: 15
  },
  {
    id: 3,
    title: 'Add a Paragraph',
    description: 'Write about yourself',
    challenge: 'Add a paragraph introducing yourself',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>About Me</title>
  <style>
    h1 {
      color: blue;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <!-- Add your paragraph here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['p']
    },
    xpReward: 25,
    coinsReward: 10
  },
  {
    id: 4,
    title: 'Colorful Background',
    description: 'Make your page colorful',
    challenge: 'Add a background color to your page',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>Colorful Page</title>
  <style>
    /* Add background color here */
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      css: ['background-color']
    },
    xpReward: 30,
    coinsReward: 15
  },
  {
    id: 5,
    title: 'Add an Image',
    description: 'Show off your character',
    challenge: 'Add an image to your page (you can use an emoji or link)',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Page with Images</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: blue;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
  <!-- Add your image here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['img']
    },
    xpReward: 35,
    coinsReward: 20
  },
  {
    id: 6,
    title: 'Create a List',
    description: 'Make a list of your favorite things',
    challenge: 'Create an unordered list with at least 3 items',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Favorite Things</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: blue;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
  <!-- Add your list here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['ul', 'li']
    },
    xpReward: 35,
    coinsReward: 20
  },
  {
    id: 7,
    title: 'Add a Link',
    description: 'Connect to the web',
    challenge: 'Add a link to your favorite website',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Links Page</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: blue;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
  <!-- Add your link here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['a']
    },
    xpReward: 35,
    coinsReward: 20
  },
  {
    id: 8,
    title: 'Style with Borders',
    description: 'Add borders and padding',
    challenge: 'Add a border and padding to your heading',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>Styled with Borders</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: blue;
      text-align: center;
      /* Add border and padding here */
    }
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      css: ['border', 'padding']
    },
    xpReward: 40,
    coinsReward: 25
  },
  {
    id: 9,
    title: 'Use Divs and Classes',
    description: 'Organize your content',
    challenge: 'Create a div with a class and style it',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>Divs and Classes</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: blue;
      text-align: center;
    }
    /* Add a class style here */
  </style>
</head>
<body>
  <h1>Hello, CodeKingdom!</h1>
  <p>This is my awesome website!</p>
  <!-- Add a div with a class here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['div'],
      css: ['.']
    },
    xpReward: 45,
    coinsReward: 30
  },
  {
    id: 10,
    title: 'Build a Complete Page',
    description: 'Put it all together!',
    challenge: 'Create a complete page with heading, paragraph, list, link, and styled div',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Complete Website</title>
  <style>
    body {
      background-color: lightblue;
      font-family: Arial, sans-serif;
    }
    /* Add your styles here */
  </style>
</head>
<body>
  <!-- Build your complete page here -->
  
</body>
</html>`,
    cssTemplate: `/* Add your styles here */`,
    requirements: {
      html: ['h1', 'p', 'ul', 'a', 'div']
    },
    xpReward: 50,
    coinsReward: 40
  },
  {
    id: 11,
    title: 'Add a Navigation Bar',
    description: 'Create a simple top navigation menu',
    challenge: 'Add a <nav> with links laid out in a row using flexbox',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Website with Navigation</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: lightblue;
    }
    /* Add your navigation styles here */
  </style>
</head>
<body>
  <!-- Add your nav bar here -->
  
</body>
</html>`,
    cssTemplate: `/* Hint: try display: flex; justify-content: space-around; */`,
    requirements: {
      html: ['nav'],
      css: ['display: flex', 'justify-content']
    },
    xpReward: 60,
    coinsReward: 45
  },
  {
    id: 12,
    title: 'Two-Column Layout',
    description: 'Create a content and sidebar layout',
    challenge: 'Use flexbox to create a main content area and a sidebar side by side',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>Two Column Layout</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f0f4ff;
    }
    /* Add your layout styles here */
  </style>
</head>
<body>
  <h1>My Awesome Page</h1>
  <!-- Wrap your columns in a container -->
  <!-- Example:
  <div class="layout">
    <div class="main">Main content here</div>
    <div class="sidebar">Sidebar here</div>
  </div>
  -->
  
</body>
</html>`,
    cssTemplate: `/* Hint: .layout { display: flex; } */`,
    requirements: {
      html: ['div'],
      css: ['display: flex', 'sidebar']
    },
    xpReward: 70,
    coinsReward: 55
  },
  {
    id: 13,
    title: 'Hero Section',
    description: 'Design a big hero banner for your site',
    challenge: 'Create a hero section with a background image, big heading, paragraph, and a call-to-action button',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>Hero Section</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }
    /* Add your hero section styles here */
  </style>
</head>
<body>
  <!-- Example structure:
  <section class="hero">
    <h1>Welcome to My Site</h1>
    <p>This is my awesome hero section!</p>
    <button>Get Started</button>
  </section>
  -->
  
</body>
</html>`,
    cssTemplate: `/* Hint: try background-image, padding, text-align: center; */`,
    requirements: {
      html: ['h1', 'p', 'button'],
      css: ['background-image', 'padding']
    },
    xpReward: 80,
    coinsReward: 70
  },
  {
    id: 14,
    title: 'Image Gallery',
    description: 'Show multiple pictures in a neat grid',
    challenge: 'Create an image gallery with at least 3 images in a row using CSS layout',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <title>My Image Gallery</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
    }
    /* Add your gallery styles here */
  </style>
</head>
<body>
  <h1>My Favorite Pictures</h1>
  <!-- Example structure:
  <div class="gallery">
    <img src="https://placekitten.com/200/200" alt="Cute cat">
    <img src="https://placekitten.com/201/200" alt="Another cat">
    <img src="https://placekitten.com/202/200" alt="Third cat">
  </div>
  -->
  
</body>
</html>`,
    cssTemplate: `/* Hint: .gallery { display: flex; gap: 10px; } */`,
    requirements: {
      html: ['img'],
      css: ['display: flex']
    },
    xpReward: 90,
    coinsReward: 80
  }
];

export default function WebDevGamePage() {
  const { character, addExperience, addCoins, addPoints } = useCharacter();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true); // Start expanded by default
  const previewRef = useRef<HTMLIFrameElement>(null);

  const level = levels[currentLevel];

  // Check if accessories are equipped
  const pinkHoodieEquipped = character?.accessories?.some(
    acc => acc.name === 'Pink Hoodie' && acc.isEquipped
  ) || false;
  const whiteSneakersEquipped = character?.accessories?.some(
    acc => acc.name === 'White Sneakers' && acc.isEquipped
  ) || false;

  // Function to determine the character image based on equipped accessories
  const getCharacterImage = () => {
    // If both Pink Hoodie and White Sneakers are equipped and character is the original girl, show both version
    if (pinkHoodieEquipped && whiteSneakersEquipped && character.id === 'girl1') {
      return girlHoodieSneakersCharacter;
    }
    // If only Pink Hoodie is equipped and character is the original girl, show hoodie version
    if (pinkHoodieEquipped && character.id === 'girl1') {
      return girlHoodieCharacter;
    }
    // Otherwise, use the character image or fallback based on character ID
    if (character.image) {
      return character.image;
    }
    // Fallback to appropriate character based on ID
    if (character.id === 'boy1') return boyCharacter;
    if (character.id === 'brown-boy1') return brownBoyCharacter;
    if (character.id === 'brown-girl1') return brownGirlCharacter;
    if (character.id === 'blonde-girl1') return blondeGirlCharacter;
    if (character.id === 'blonde-boy1') return blondeBoyCharacter;
    return girlCharacter; // Default fallback
  };

  // Get equipped pet
  const equippedPet = character.accessories?.find(acc => acc.type === 'pet' && acc.isEquipped);
  
  // Get equipped accessories (excluding pets)
  const equippedAccessories = character.accessories?.filter(
    acc => acc.type !== 'pet' && acc.isEquipped && acc.type !== 'background'
  ) || [];

  // Initialize code when level changes
  useEffect(() => {
    if (level) {
      setHtmlCode(level.htmlTemplate);
      setCssCode(level.cssTemplate);
      setShowSuccess(false);
    }
  }, [currentLevel]);

  // Helper to combine HTML and CSS into a full document string
  const buildFullHtml = () => {
    let fullHtml = htmlCode;
    
    // Check if CSS code has actual CSS rules (not just comments or empty)
    const hasActualCSS = cssCode && cssCode.trim() && 
      !cssCode.replace(/\/\*[\s\S]*?\*\//g, '').trim().match(/^\/\/.*$/m) && // Not just comments
      cssCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim().length > 0; // Has actual CSS after removing comments
    
    // Check if HTML already has a style tag
    const hasStyleTag = /<style[\s\S]*?<\/style>/gi.test(fullHtml);
    
    if (hasStyleTag) {
      if (hasActualCSS) {
        // Replace the content of existing style tag with CSS from editor
        fullHtml = fullHtml.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, `<style>${cssCode}</style>`);
      }
      // If CSS editor only has comments, keep the existing style tag as-is
    } else {
      // No style tag exists, add one with CSS from editor (only if there's actual CSS)
      const cssToAdd = hasActualCSS ? `<style>${cssCode}</style>` : '';
      
      if (cssToAdd) {
        if (fullHtml.includes('</head>')) {
          // Add style tag before closing head
          fullHtml = fullHtml.replace('</head>', `${cssToAdd}</head>`);
        } else if (fullHtml.includes('<head>')) {
          // Add style tag after opening head
          fullHtml = fullHtml.replace('<head>', `<head>${cssToAdd}`);
        } else if (fullHtml.includes('<html>')) {
          // Add head with style if html tag exists but no head
          fullHtml = fullHtml.replace('<html>', `<html><head>${cssToAdd}</head>`);
        } else if (fullHtml.includes('<!DOCTYPE')) {
          // Add after DOCTYPE
          if (!fullHtml.includes('<html>')) {
            fullHtml = fullHtml.replace('<!DOCTYPE html>', `<!DOCTYPE html><html><head>${cssToAdd}</head><body>`);
            if (!fullHtml.includes('</body>')) {
              fullHtml += '</body></html>';
            }
          } else {
            fullHtml = fullHtml.replace('<html>', `<html><head>${cssToAdd}</head>`);
          }
        } else {
          // No structure, wrap everything
          fullHtml = `<!DOCTYPE html><html><head>${cssToAdd}</head><body>${fullHtml}</body></html>`;
        }
      }
    }
    
    return fullHtml;
  };

  // Update preview in real-time
  useEffect(() => {
    // Small delay to ensure iframe is ready
    const timer = setTimeout(() => {
      updatePreview();
    }, 100);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  const updatePreview = () => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      // Wait a bit for iframe to be ready
      setTimeout(() => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          const fullHtml = buildFullHtml();
          
          try {
            doc.open();
            doc.write(fullHtml);
            doc.close();
          } catch (error) {
            console.error('Error updating preview:', error);
          }
        }
      }, 50);
    }
  };

  const checkRequirements = (): boolean => {
    const req = level.requirements;
    const combinedCode = htmlCode + cssCode;

    // Check HTML requirements
    if (req.html) {
      for (const tag of req.html) {
        if (!combinedCode.toLowerCase().includes(`<${tag}`)) {
          return false;
        }
      }
    }

    // Check CSS requirements
    if (req.css) {
      for (const prop of req.css) {
        if (!cssCode.toLowerCase().includes(prop.toLowerCase())) {
          return false;
        }
      }
    }

    // Check text requirements
    if (req.text) {
      if (!htmlCode.includes(req.text)) {
        return false;
      }
    }

    return true;
  };

  const submitLevel = () => {
    if (checkRequirements()) {
      // Level completed!
      setCompletedLevels([...completedLevels, level.id]);
      
      // Calculate points: base points + bonus for level difficulty
      const basePoints = 50;
      const levelPoints = basePoints + (level.id * 25); // More points for higher levels
      
      addExperience(level.xpReward);
      addCoins(level.coinsReward);
      addPoints(levelPoints);
      setShowSuccess(true);

      // Auto-advance to next level after 2 seconds
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(currentLevel + 1);
        }
      }, 2000);
    } else {
      alert('Not quite! Check the requirements and try again.');
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  // Determine if the user has completed all levels
  const allLevelsCompleted = levels.every(l => completedLevels.includes(l.id));

  const exportWebsite = () => {
    if (!allLevelsCompleted) {
      alert('Complete all levels in the Web Developer Game before exporting your website.');
      return;
    }
    
    const fullHtml = buildFullHtml();
    
    try {
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codekingdom-website.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting website:', error);
      alert('Sorry, something went wrong exporting your website.');
    }
  };

  const backgroundStyle = character.background ? {
    background: character.background.value,
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  } : {};

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '100%', margin: '0 auto', ...backgroundStyle }}>
        <Navigation />
        <div className="web-dev-game" style={{ minHeight: 'calc(100vh - 60px)', height: 'auto', overflow: 'auto' }}>
          <div className="game-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              <h1>🌐 Web Developer Game</h1>
              <div className="level-info">
                <span>Level {currentLevel + 1} of {levels.length}</span>
                <span className="xp-display">⭐ {character.experience} XP</span>
                <span className="coins-display">🪙 {character.coins} Coins</span>
                <span className="points-display">🏆 {character.points || 0} Points</span>
              </div>
            </div>
            {/* Export + Character and Pet display */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn-secondary"
                onClick={exportWebsite}
                disabled={!allLevelsCompleted}
                style={{ whiteSpace: 'nowrap' }}
              >
                {allLevelsCompleted ? 'Export My Website' : 'Export (finish all levels)'}
              </button>
              {/* Character display */}
              <div className="character-display-panel" style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                padding: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #9b59b6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '55px',
                minWidth: '55px'
              }}>
                <div style={{
                  position: 'relative',
                  width: '35px',
                  height: '35px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={getCharacterImage()} 
                    alt={character.name || 'Character'} 
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      (e.target as HTMLImageElement).src = character.id === 'boy1' ? boyCharacter : girlCharacter;
                    }}
                  />
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: '#333',
                  fontSize: '0.55rem',
                  textAlign: 'center',
                  lineHeight: '1.1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>{character.name || 'Character'}</div>
              </div>
              
              {/* Pet display */}
              <div className="pet-display-panel" style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                padding: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f39c12',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: '55px',
                minWidth: '55px'
              }}>
                <div style={{
                  position: 'relative',
                  width: '35px',
                  height: '35px',
                  backgroundColor: '#fff8e1',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #f39c12',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {equippedPet ? (
                    equippedPet.image && (equippedPet.image.includes('.png') || equippedPet.image.includes('.jpg') || equippedPet.image.startsWith('/') || equippedPet.image.startsWith('http')) ? (
                      <img 
                        src={equippedPet.image} 
                        alt={equippedPet.name} 
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        onError={(e) => {
                          console.error('Pet image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '18px' }}>{equippedPet.image || '🐾'}</span>
                    )
                  ) : (
                    <span style={{ fontSize: '16px', opacity: 0.5 }}>🐾</span>
                  )}
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: '#333',
                  fontSize: '0.55rem',
                  textAlign: 'center',
                  lineHeight: '1.1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {equippedPet ? equippedPet.name : 'Pet'}
                </div>
              </div>
              
              {/* Accessories display */}
              {equippedAccessories.length > 0 && equippedAccessories.map((accessory, idx) => (
                <div key={accessory.id || idx} className="accessory-display-panel" style={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '4px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #9b59b6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  width: '55px',
                  minWidth: '55px'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '35px',
                    height: '35px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '3px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #9b59b6',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {accessory.image && (accessory.image.includes('.png') || accessory.image.includes('.jpg') || accessory.image.startsWith('/') || accessory.image.startsWith('http')) ? (
                      <img 
                        src={accessory.image} 
                        alt={accessory.name} 
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        onError={(e) => {
                          console.error('Accessory image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '18px' }}>{accessory.image || '✨'}</span>
                    )}
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '0.55rem',
                    textAlign: 'center',
                    lineHeight: '1.1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%'
                  }}>
                    {accessory.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="level-panel">
            <h2>{level.title}</h2>
            <p className="level-description">{level.description}</p>
            <div className="challenge-box">
              <strong>Challenge:</strong> {level.challenge}
            </div>
            <div className="requirements-box">
              <strong>Requirements:</strong>
              <ul>
                {level.requirements.html && (
                  <li>HTML: Use {level.requirements.html.join(', ')}</li>
                )}
                {level.requirements.css && (
                  <li>CSS: Use {level.requirements.css.join(', ')}</li>
                )}
                {level.requirements.text && (
                  <li>Text: Include "{level.requirements.text}"</li>
                )}
              </ul>
            </div>

            {/* How to Play / Hints Section */}
            <div className="how-to-play-panel" style={{
              marginTop: '15px',
              border: '2px solid #9b59b6',
              borderRadius: '8px',
              backgroundColor: '#f8f4ff',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8e44ad'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9b59b6'}
              >
                <span>💡 How to Play & Hints</span>
                <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: showHowToPlay ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>
              <div style={{
                maxHeight: showHowToPlay ? '2000px' : '0',
                overflow: showHowToPlay ? 'visible' : 'hidden',
                transition: 'max-height 0.3s ease-in-out',
                display: showHowToPlay ? 'block' : 'none'
              }}>
                <div style={{ padding: '15px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#9b59b6', marginBottom: '8px' }}>📝 How It Works:</h4>
                    <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                      <li>The <strong>HTML Code</strong> editor shows the foundation structure (like <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, <code>&lt;body&gt;</code>). This boilerplate code is the foundation of every webpage, but it won't always be visible in later levels - you'll need to remember it!</li>
                      <li>Edit the <strong>HTML Code</strong> on the left to add elements to your webpage</li>
                      <li>Edit the <strong>CSS Code</strong> to style your HTML elements</li>
                      <li>The <strong>Live Preview</strong> on the right updates automatically as you type!</li>
                      <li>Click <strong>"Submit Level"</strong> when you've completed the requirements</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#9b59b6', marginBottom: '8px' }}>💡 Hints for This Level:</h4>
                    {level.id === 1 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Use <code>&lt;h1&gt;</code> tags to create a heading</li>
                        <li>Example: <code>&lt;h1&gt;Hello, CodeKingdom!&lt;/h1&gt;</code></li>
                        <li>Add it inside the <code>&lt;body&gt;</code> section</li>
                      </ul>
                    )}
                    {level.id === 2 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Add CSS inside the <code>&lt;style&gt;</code> tag in the <code>&lt;head&gt;</code> section</li>
                        <li>To make text blue: <code>color: blue;</code></li>
                        <li>To center text: <code>text-align: center;</code></li>
                        <li>Example: <code>h1 &#123; color: blue; text-align: center; &#125;</code></li>
                      </ul>
                    )}
                    {level.id === 3 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Use <code>&lt;p&gt;</code> tags to create a paragraph</li>
                        <li>Example: <code>&lt;p&gt;My name is...&lt;/p&gt;</code></li>
                        <li>Add it after the <code>&lt;h1&gt;</code> tag in the <code>&lt;body&gt;</code> section</li>
                        <li>The styling from the previous level is already there!</li>
                      </ul>
                    )}
                    {level.id === 4 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Add a background color to the <code>body</code> element</li>
                        <li>Use: <code>body &#123; background-color: lightblue; &#125;</code></li>
                        <li>You can use colors like: <code>lightblue</code>, <code>lightgreen</code>, <code>pink</code>, <code>yellow</code>, etc.</li>
                        <li>Add this CSS inside the <code>&lt;style&gt;</code> tag</li>
                      </ul>
                    )}
                    {level.id === 5 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Use <code>&lt;img&gt;</code> tag to add an image</li>
                        <li>Example: <code>&lt;img src="https://example.com/image.png" alt="My image"&gt;</code></li>
                        <li>Or use an emoji: <code>&lt;img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50'%3E🎮%3C/text%3E%3C/svg%3E" alt="Game"&gt;</code></li>
                        <li>Add it in the <code>&lt;body&gt;</code> section</li>
                      </ul>
                    )}
                    {level.id === 6 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Use <code>&lt;ul&gt;</code> for an unordered list (bullets)</li>
                        <li>Use <code>&lt;li&gt;</code> for each list item</li>
                        <li>Example: <code>&lt;ul&gt;&lt;li&gt;Item 1&lt;/li&gt;&lt;li&gt;Item 2&lt;/li&gt;&lt;/ul&gt;</code></li>
                        <li>Add at least 3 items!</li>
                      </ul>
                    )}
                    {level.id > 6 && (
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Read the challenge carefully</li>
                        <li>Check the requirements box to see what HTML tags or CSS properties you need</li>
                        <li>Look at the example code in the template for guidance</li>
                        <li>The Live Preview updates automatically - use it to see your changes!</li>
                      </ul>
                    )}
                  </div>

                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: '5px', 
                    padding: '10px',
                    marginTop: '10px'
                  }}>
                    <strong>💡 Pro Tip:</strong> The Live Preview updates automatically as you type. Watch it to see your changes in real-time!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split-container">
            {/* Left Side - Code Editor */}
            <div className="editor-panel">
              <div className="editor-header">
                <h3>Code Editor</h3>
              </div>
              <div className="editor-content">
                <div className="editor-section">
                  <label>HTML Code:</label>
                  <textarea
                    className="code-editor"
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck={false}
                    placeholder="Write your HTML here..."
                  />
                </div>
                <div className="editor-section">
                  <label>CSS Code:</label>
                  <textarea
                    className="code-editor"
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    spellCheck={false}
                    placeholder={cssCode.trim() === '' || cssCode === level.cssTemplate ? 'Example: h1 { color: blue; text-align: center; }' : ''}
                  />
                </div>
              </div>
              <div className="editor-actions">
                <button className="btn-secondary" onClick={prevLevel} disabled={currentLevel === 0}>
                  ← Previous
                </button>
                <button className="btn-primary" onClick={submitLevel}>
                  ✓ Submit Level
                </button>
                <button className="btn-secondary" onClick={nextLevel} disabled={currentLevel === levels.length - 1}>
                  Next →
                </button>
              </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="preview-panel">
              <div className="preview-header">
                <h3>Live Preview</h3>
                <span className="preview-badge">Updates automatically!</span>
              </div>
              <div className="preview-content">
                <iframe
                  ref={previewRef}
                  className="preview-iframe"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  onLoad={() => {
                    // Ensure preview updates when iframe loads
                    updatePreview();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Success Modal */}
          {showSuccess && (
            <div className="success-modal">
              <div className="success-content">
                <div className="success-icon">🎉</div>
                <h2>Level Complete!</h2>
                <p>You earned {level.xpReward} XP, {level.coinsReward} coins, and {50 + (level.id * 25)} points!</p>
                {currentLevel < levels.length - 1 ? (
                  <p>Moving to next level...</p>
                ) : (
                  <p>Congratulations! You've completed all levels! 🏆</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
