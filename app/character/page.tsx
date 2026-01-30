'use client';

import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/CharacterPage.css';

// Image paths for Next.js public folder
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const blondeBoyCharacter = '/images/characters/Boy_Character_BlondeHair_NEW.png'; // <-- new file in public/images/characters
const girlCharacterHoodie = '/images/characters/Girl_Character_In_PinkHoodie.png';
const girlCharacterHoodieSneakers = '/images/characters/Girl_Character_In_PinkHoodie_WhiteSneakers.png';

// Character options (base characters only - hoodie and sneakers are earned rewards)
const CHARACTERS = [
  { id: 'girl1', name: 'Girl with Brown Hair', image: girlCharacter },
  { id: 'boy1', name: 'Boy with Brown Hair', image: boyCharacter },
  { id: 'brown-girl1', name: 'Girl with Black Hair', image: brownGirlCharacter },
  { id: 'brown-boy1', name: 'Boy with Black Hair', image: brownBoyCharacter },
  { id: 'blonde-girl1', name: 'Girl with Blonde Hair', image: blondeGirlCharacter },
  { id: 'blonde-boy1', name: 'Boy with Blonde Hair', image: blondeBoyCharacter }
];

export default function CharacterPage() {
  console.log('CharacterPage rendering');
  
  // Get character context
  const { character, updateCharacterName, setCharacter, toggleAccessory, setBackground } = useCharacter();
  console.log('CharacterPage: character from context', character);
  
  // State to track selected items
  const [selectedCharacter, setSelectedCharacter] = useState(
    CHARACTERS.find(c => c.id === character.id) || CHARACTERS[0]
  );
  const [name, setName] = useState(character.name || '');
  const [characterSaved, setCharacterSaved] = useState(false);
  
  // Update selected character when character.id changes
  useEffect(() => {
    const found = CHARACTERS.find(c => c.id === character.id);
    if (found) {
      setSelectedCharacter(found);
    }
  }, [character.id]);
  
  // Get collected items (excluding default items)
  const collectedItems = (character?.accessories || []).filter(item => item && item.source !== 'default');
  
  // Separate backgrounds from other items
  // Backgrounds are identified by: having backgroundData, id starting with 'bg-', or type being 'background'
  const backgrounds = collectedItems.filter(item => 
    item.backgroundData || 
    (item.id && item.id.startsWith('bg-')) || 
    item.type === 'background'
  );
  const otherItems = collectedItems.filter(item => 
    !item.backgroundData && 
    !(item.id && item.id.startsWith('bg-')) && 
    item.type !== 'background'
  );
  
  // Check if accessories are equipped
  const pinkHoodieEquipped = character?.accessories?.some(
    acc => acc.name === 'Pink Hoodie' && acc.isEquipped
  ) || false;
  const whiteSneakersEquipped = character?.accessories?.some(
    acc => acc.name === 'White Sneakers' && acc.isEquipped
  ) || false;
  
  // Determine which character image to display
  const getCharacterImage = () => {
    const currentCharId = selectedCharacter.id || character.id;
    const isGirl = currentCharId === 'girl1' || currentCharId === 'brown-girl1' || currentCharId === 'blonde-girl1';
    
    // If both Pink Hoodie and White Sneakers are equipped and character is a girl, show both version
    // Note: Currently only the original girl character has hoodie/sneakers variants
    if (pinkHoodieEquipped && whiteSneakersEquipped && currentCharId === 'girl1') {
      return girlCharacterHoodieSneakers;
    }
    // If only Pink Hoodie is equipped and character is a girl, show hoodie version
    if (pinkHoodieEquipped && currentCharId === 'girl1') {
      return girlCharacterHoodie;
    }
    // Otherwise, use the selected character image or saved character image
    return character.image || selectedCharacter.image;
  };
  
  // Handle saving the character
  const saveCharacter = () => {
    // Update the character name in context
    updateCharacterName(name);
    
    // Update the character image in context
    setCharacter(prev => ({
      ...prev,
      image: selectedCharacter.image
    }));
    
    console.log('Character saved:', { name, characterId: selectedCharacter.id });
    
    setCharacterSaved(true);
    
    // Reset the saved message after 3 seconds
    setTimeout(() => {
      setCharacterSaved(false);
    }, 3000);
  };
  
  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <Navigation />
        <div className="character-page">
          <h1>Create Your Coding Buddy!</h1>
          <p className="subtitle">Design a character to join you on your coding adventure!</p>
          
          <div className="character-container">
            {/* Character preview with accessories */}
            <div className="character-preview" style={{ backgroundColor: 'transparent', minWidth: '300px' }}>
              <div className="character-image-container" style={{ 
                position: 'relative',
                width: '200px',
                height: '200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={getCharacterImage()} 
                  alt={character.name || selectedCharacter.name} 
                  className="character-image"
                  onError={(e) => {
                    e.currentTarget.src = selectedCharacter.image;
                  }}
                />
              </div>
              {character.name && (
                <div className="character-name" style={{ 
                  textAlign: 'center', 
                  marginTop: '10px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {character.name}
                </div>
              )}
            </div>
            
            {/* Character customization options */}
            <div className="character-options">
              <div className="option-section">
                <h3>Name Your Character</h3>
                <input 
                  type="text" 
                  placeholder="Enter a cool name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="name-input"
                />
              </div>
              
              <div className="option-section">
                <h3>Choose Character</h3>
                <div className="character-selection">
                  {CHARACTERS.map((char) => (
                    <div 
                      key={char.id}
                      className={`character-option ${selectedCharacter.id === char.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCharacter(char)}
                    >
                      <img src={char.image} alt={char.name} className="character-thumbnail" />
                      <span>{char.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="save-button" 
                onClick={saveCharacter}
                disabled={!name}
              >
                Save My Character
              </button>
              
              {characterSaved && (
                <div className="save-message">
                  Awesome! Your character has been saved! 🎉
                </div>
              )}
            </div>
          </div>
          
          {/* Inventory Section */}
          <div className="inventory-section" style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #9b59b6'
          }}>
            <h2 style={{ 
              color: '#9b59b6', 
              marginTop: '0',
              marginBottom: '15px',
              fontSize: '1.8rem'
            }}>
              My Collection 🎒
            </h2>
            
            {!collectedItems || collectedItems.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#7f8c8d'
              }}>
                <p style={{ fontSize: '1.2rem' }}>No items collected yet!</p>
                <p>Complete adventures and quizzes to earn cool items! 🎮</p>
              </div>
            ) : (
              <>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '15px',
                  fontSize: '1rem'
                }}>
                  Click on an item to equip or unequip it on your character
                </p>
                
                {/* Backgrounds Section */}
                {backgrounds.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ 
                      color: '#9b59b6', 
                      marginBottom: '10px',
                      fontSize: '1.3rem'
                    }}>
                      🎨 Backgrounds
                    </h3>
                    <div className="inventory-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '15px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: '10px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}>
                      {backgrounds.filter(item => item && item.id).map((item) => {
                        const isEquipped = character.background?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isEquipped) {
                                setBackground(null);
                                setCharacter(prev => ({
                                  ...prev,
                                  accessories: prev.accessories.map(acc => 
                                    acc.id === item.id ? { ...acc, isEquipped: false } : acc
                                  )
                                }));
                              } else {
                                if (item.backgroundData) {
                                  setBackground(item.backgroundData);
                                  setCharacter(prev => ({
                                    ...prev,
                                    accessories: prev.accessories.map(acc => 
                                      acc.id === item.id ? { ...acc, isEquipped: true } : 
                                      acc.backgroundData ? { ...acc, isEquipped: false } : acc
                                    )
                                  }));
                                }
                              }
                            }}
                            style={{
                              backgroundColor: isEquipped ? '#e8f5e9' : '#fff',
                              border: isEquipped ? '3px solid #4caf50' : '2px solid #ddd',
                              borderRadius: '10px',
                              padding: '15px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              boxShadow: isEquipped ? '0 4px 8px rgba(76, 175, 80, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = isEquipped 
                                ? '0 4px 8px rgba(76, 175, 80, 0.3)' 
                                : '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                          >
                            {isEquipped && (
                              <div style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </div>
                            )}
                            <div style={{
                              width: '100px',
                              height: '100px',
                              margin: '0 auto 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              overflow: 'hidden',
                              background: item.backgroundData?.value || '#f0f8ff'
                            }}>
                              <span style={{ fontSize: '50px' }}>{item.image || '🎨'}</span>
                            </div>
                            <h4 style={{ 
                              margin: '5px 0',
                              fontSize: '1rem',
                              color: '#333',
                              fontWeight: 'bold'
                            }}>
                              {item.name}
                            </h4>
                            <p style={{ 
                              margin: '5px 0',
                              fontSize: '0.85rem',
                              color: '#666'
                            }}>
                              {item.description}
                            </p>
                            <div style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              marginTop: '5px',
                              backgroundColor: item.rarity === 'rare' ? '#ffd700' : 
                                              item.rarity === 'epic' ? '#9b59b6' :
                                              item.rarity === 'legendary' ? '#e74c3c' : '#95a5a6',
                              color: 'white'
                            }}>
                              {item.rarity?.toUpperCase()}
                            </div>
                            {isEquipped && (
                              <p style={{
                                marginTop: '8px',
                                fontSize: '0.8rem',
                                color: '#4caf50',
                                fontWeight: 'bold'
                              }}>
                                EQUIPPED
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Other Items Section */}
                {otherItems.length > 0 && (
                  <div>
                    {backgrounds.length > 0 && (
                      <h3 style={{ 
                        color: '#9b59b6', 
                        marginBottom: '10px',
                        marginTop: '20px',
                        fontSize: '1.3rem'
                      }}>
                        🎒 Accessories & Pets
                      </h3>
                    )}
                    <div className="inventory-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '15px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      padding: '10px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}>
                      {otherItems.filter(item => item && item.id).map((item) => (
                        <div
                      key={item.id}
                      onClick={() => toggleAccessory(item.id)}
                      style={{
                        backgroundColor: item.isEquipped ? '#e8f5e9' : '#fff',
                        border: item.isEquipped ? '3px solid #4caf50' : '2px solid #ddd',
                        borderRadius: '10px',
                        padding: '15px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        boxShadow: item.isEquipped ? '0 4px 8px rgba(76, 175, 80, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = item.isEquipped 
                          ? '0 4px 8px rgba(76, 175, 80, 0.3)' 
                          : '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      {item.isEquipped && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f8ff',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        overflow: 'hidden'
                      }}>
                        {item.image && (item.image.startsWith('http') || item.image.includes('.png') || item.image.includes('.jpg') || item.image.includes('/')) ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '50px' }}>{item.image || '📦'}</span>
                        )}
                      </div>
                      <h4 style={{ 
                        margin: '5px 0',
                        fontSize: '1rem',
                        color: '#333',
                        fontWeight: 'bold'
                      }}>
                        {item.name}
                      </h4>
                      <p style={{ 
                        margin: '5px 0',
                        fontSize: '0.85rem',
                        color: '#666'
                      }}>
                        {item.description}
                      </p>
                      <div style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginTop: '5px',
                        backgroundColor: item.rarity === 'rare' ? '#ffd700' : 
                                        item.rarity === 'epic' ? '#9b59b6' :
                                        item.rarity === 'legendary' ? '#e74c3c' : '#95a5a6',
                        color: 'white'
                      }}>
                        {item.rarity?.toUpperCase()}
                      </div>
                      {item.isEquipped && (
                        <p style={{
                          marginTop: '8px',
                          fontSize: '0.8rem',
                          color: '#4caf50',
                          fontWeight: 'bold'
                        }}>
                          EQUIPPED
                        </p>
                      )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
