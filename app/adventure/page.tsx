'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacter, type Accessory, type AccessoryType } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/AdventureGamePage.css';

// Image paths for Next.js public folder
const pinkHoodie = '/images/items/Pink_Hoodie.png';
const whiteSneakers = '/images/items/WhiteSneakers.png';
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const girlHoodieCharacter = '/images/characters/Girl_Character_In_PinkHoodie.png';
const girlHoodieSneakersCharacter = '/images/characters/Girl_Character_In_PinkHoodie_WhiteSneakers.png';

function AdventurePage() {
  console.log('AdventurePage rendering');
  
  // Basic error handling to prevent white screen
  try {
    // Add debug logging
    console.log('AdventurePage: About to use character context');
    
    // Preload character images
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
      console.log('Preloading image:', src);
    };
    
    preloadImage(girlCharacter);
    preloadImage(boyCharacter);
    preloadImage(brownGirlCharacter);
    preloadImage(brownBoyCharacter);
    preloadImage(blondeGirlCharacter);
  
    const { character, addCoins, addExperience, addAccessory, addPoints } = useCharacter();
    
    // Check if accessories are equipped
    const pinkHoodieEquipped = character?.accessories?.some(
      acc => acc.name === 'Pink Hoodie' && acc.isEquipped
    ) || false;
    const whiteSneakersEquipped = character?.accessories?.some(
      acc => acc.name === 'White Sneakers' && acc.isEquipped
    ) || false;
    
    // Get equipped accessories (excluding pets and special items like Pink Hoodie/White Sneakers that change character image)
    // Note: Backgrounds are stored separately in character.background, not as accessories
    const equippedAccessories = character?.accessories?.filter((acc): acc is Accessory => {
      if (!acc.isEquipped) return false;
      if (acc.type === 'pet') return false;
      if (acc.name === 'Pink Hoodie' || acc.name === 'White Sneakers') return false;
      return true;
    }) || [];
    
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
      return girlCharacter; // Default fallback
    };
    
    // Debug logging
    console.log('AdventurePage: Character from context:', {
      name: character.name,
      id: character.id,
      image: character.image,
      hasImage: !!character.image,
      pinkHoodieEquipped,
      boyCharacterPath: boyCharacter,
      girlCharacterPath: girlCharacter
    });
    
    // Game state
    const [position, setPosition] = useState({ x: 1, y: 1 });
    // Use a ref to track position synchronously (for immediate use in move function)
    const positionRef = useRef({ x: 1, y: 1 });
    
    const [direction, setDirection] = useState('right');
    // Use a ref to track direction synchronously (for immediate use in move function)
    const directionRef = useRef('right');
    
    const [diamonds, setDiamonds] = useState(0);
    const [log, setLog] = useState(['Welcome to the adventure!']);
    const [level, setLevel] = useState(1);
    const [showReward, setShowReward] = useState(false);
    const [showDiamondCelebration, setShowDiamondCelebration] = useState(false);
    const [commandSequence, setCommandSequence] = useState<string[]>([]);
    const [diamondsCollectedThisSequence, setDiamondsCollectedThisSequence] = useState(0);
    
    // Determine reward based on level
    const getRewardForLevel = (currentLevel: number) => {
      if (currentLevel === 1) {
        return { name: 'Pink Hoodie', image: pinkHoodie };
      } else if (currentLevel === 2) {
        return { name: 'White Sneakers', image: whiteSneakers };
      }
      return { name: 'Pink Hoodie', image: pinkHoodie }; // Default
    };
    
    const [rewardItem, setRewardItem] = useState(getRewardForLevel(1));
    
    // Update reward item when level changes
    useEffect(() => {
      setRewardItem(getRewardForLevel(level));
    }, [level]);
    const [speechBubble, setSpeechBubble] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [bubblePosition, setBubblePosition] = useState<{ top: number; left: number } | null>(null);
    const [showHowToPlay, setShowHowToPlay] = useState(true); // State for collapsible instructions
    const gridRef = useRef<HTMLDivElement>(null);
    
    // Update bubble position when character moves or bubble appears
    useEffect(() => {
      if (speechBubble.visible && gridRef.current) {
        const cellElement = gridRef.current.querySelector(`[data-x="${position.x - 1}"][data-y="${position.y - 1}"]`) as HTMLElement;
        if (cellElement) {
          const cellRect = cellElement.getBoundingClientRect();
          const gridRect = gridRef.current.getBoundingClientRect();
          setBubblePosition({
            top: cellRect.top - gridRect.top - 45,
            left: cellRect.left - gridRect.left + cellRect.width / 2
          });
        }
      }
    }, [speechBubble.visible, position.x, position.y]);
    
    // Game grid (10x10)
    // 0 = empty, 1 = wall, 2 = diamond, 3 = goal
    const grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 2, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 0, 1, 3, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    // Diamond positions for collection logic
    const diamondPositions = [
      { x: 7, y: 1 },
      { x: 3, y: 3 },
      { x: 1, y: 7 }
    ];
    
    // Track collected diamonds
    const [collectedDiamonds, setCollectedDiamonds] = useState([false, false, false]);
    
    // Keep refs in sync with state
    useEffect(() => {
      directionRef.current = direction;
    }, [direction]);
    
    useEffect(() => {
      positionRef.current = position;
    }, [position]);
    
    // Movement functions
    const move = async (steps: number): Promise<void> => {
      return new Promise((resolve) => {
        // Use refs to get current position and direction synchronously
        const currentPosition = positionRef.current;
        const currentDirection = directionRef.current;
        
        let newX = currentPosition.x;
        let newY = currentPosition.y;
        
        if (currentDirection === 'up') newY -= steps;
        if (currentDirection === 'down') newY += steps;
        if (currentDirection === 'left') newX -= steps;
        if (currentDirection === 'right') newX += steps;
        
        // Check boundaries and walls
        if (newX < 0 || newX >= 10 || newY < 0 || newY >= 10 || grid[newY][newX] === 1) {
          addToLog("Can't move there! There's a wall or boundary.");
          resolve();
          return;
        }
        
        // Update both state and ref immediately
        positionRef.current = { x: newX, y: newY };
        setPosition({ x: newX, y: newY });
        addToLog(`Moved ${steps} step(s) ${currentDirection}.`);
        
        // Small delay to allow state update
        setTimeout(() => {
          // Check for diamonds
          const diamondIndex = diamondPositions.findIndex(d => d.x === newX && d.y === newY);
          if (diamondIndex !== -1 && !collectedDiamonds[diamondIndex]) {
            collectDiamond(diamondIndex);
          }
          
          // Check for goal
          if (grid[newY][newX] === 3 && diamonds === 3) {
            completeLevel();
          }
          
          resolve();
        }, 200);
      });
    };
    
    const turn = (newDirection: string) => {
      // Update both state and ref immediately
      directionRef.current = newDirection;
      setDirection(newDirection);
      addToLog(`Turned to face ${newDirection}.`);
    };
    
    const collectDiamond = (index: number) => {
      if (collectedDiamonds[index]) {
        addToLog('You already collected this diamond!');
        return;
      }
      
      const newCollectedDiamonds = [...collectedDiamonds];
      newCollectedDiamonds[index] = true;
      setCollectedDiamonds(newCollectedDiamonds);
      const newDiamondCount = diamonds + 1;
      setDiamonds(newDiamondCount);
      addToLog('You found a diamond! 💎');
      
      // Calculate points based on efficiency
      // Base points for collecting a diamond
      let pointsEarned = 25;
      
      // Bonus for collecting diamond in one command sequence (efficiency bonus)
      if (commandSequence.length > 0 && diamondsCollectedThisSequence === 0) {
        // If this is the first diamond in this command sequence, give efficiency bonus
        const commandCount = commandSequence.length;
        if (commandCount >= 2) {
          // Bonus points for using multiple commands efficiently
          const efficiencyBonus = Math.min(commandCount * 10, 50); // Max 50 bonus points
          pointsEarned += efficiencyBonus;
          addToLog(`⚡ Efficiency Bonus: +${efficiencyBonus} points for using ${commandCount} commands!`);
        }
      }
      
      // Track diamonds collected in this sequence
      setDiamondsCollectedThisSequence(prev => prev + 1);
      
      // Add coins, experience, and points to character
      addCoins(10);
      addExperience(15);
      addPoints(pointsEarned);
      
      // Show celebration modal
      setShowDiamondCelebration(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowDiamondCelebration(false);
      }, 2000);
      
      // Check if all diamonds are collected
      if (newDiamondCount === 3) {
        // Small delay before showing level completion
        setTimeout(() => {
          completeLevel();
        }, 2500);
      }
    };
    
    const completeLevel = () => {
      const currentReward = getRewardForLevel(level);
      setRewardItem(currentReward);
      
      // Check if the player already has this item
      const itemName = currentReward.name;
      const alreadyHasItem = character.accessories?.some(
        acc => acc.name === itemName
      ) || false;
      
      // Calculate level completion points
      const levelCompletionPoints = 100 + (level * 25); // Base 100 + 25 per level
      
      addToLog('Level completed! 🎉');
      addToLog(`You earned 50 coins, 100 XP, and ${levelCompletionPoints} points!`);
      
      // Add rewards to character
      addCoins(50);
      addExperience(100);
      addPoints(levelCompletionPoints);
      
      // Only add item if player doesn't already have it
      if (!alreadyHasItem) {
        addToLog(`You received ${currentReward.name}! 🎁`);
        
        // Show reward modal
        setShowReward(true);
        
        // Add the reward item to the character's inventory based on level
        let newAccessory: Accessory;
        if (level === 1) {
          newAccessory = {
            id: 'pink-hoodie-' + Date.now(),
            name: 'Pink Hoodie',
            type: 'hat' as const,
            image: pinkHoodie,
            description: 'A stylish pink hoodie earned from Level 1',
            rarity: 'rare' as const,
            isEquipped: false,
            source: 'adventure' as const
          };
        } else if (level === 2) {
          newAccessory = {
            id: 'white-sneakers-' + Date.now(),
            name: 'White Sneakers',
            type: 'tool' as const,
            image: whiteSneakers,
            description: 'Cool white sneakers earned from Level 2',
            rarity: 'rare' as const,
            isEquipped: false,
            source: 'adventure' as const
          };
        } else {
          // Default fallback
          newAccessory = {
            id: 'pink-hoodie-' + Date.now(),
            name: 'Pink Hoodie',
            type: 'hat' as const,
            image: pinkHoodie,
            description: 'A stylish pink hoodie earned from the adventure game',
            rarity: 'rare' as const,
            isEquipped: false,
            source: 'adventure' as const
          };
        }
        
        addAccessory(newAccessory);
      } else {
        addToLog(`You already have ${currentReward.name}! Moving to next level...`);
        // Don't show reward modal if they already have the item
        setShowReward(false);
      }
      
      // Reset for next level
      setTimeout(() => {
        setLevel(level + 1);
        setDiamonds(0);
        setCollectedDiamonds([false, false, false]);
        const resetPos = { x: 1, y: 1 };
        positionRef.current = resetPos;
        setPosition(resetPos);
        directionRef.current = 'right';
        setDirection('right');
        setShowReward(false);
      }, alreadyHasItem ? 1500 : 3000); // Shorter delay if they already have the item
    };
    
    const addToLog = (message: string) => {
      setLog(prevLog => [...prevLog, message].slice(-5)); // Keep only last 5 messages
    };
    
    // Render grid cell
    const renderCell = (cellType: number, x: number, y: number) => {
      // Player position
      if (position.x === x && position.y === y) {
        // Use a mini version of the character image instead of just an arrow
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#3498db',
            backgroundImage: 'radial-gradient(circle, #3498db, #2980b9)',
            border: '2px solid #2980b9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 0 10px rgba(52, 152, 219, 0.7)',
            position: 'relative',
            overflow: 'visible'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {direction === 'up' && '⬆️'}
              {direction === 'right' && '➡️'}
              {direction === 'down' && '⬇️'}
              {direction === 'left' && '⬅️'}
            </div>
          </div>
        );
      }
      
      // Diamond positions - check if collected
      const diamondIndex = diamondPositions.findIndex(d => d.x === x && d.y === y);
      if (diamondIndex !== -1 && !collectedDiamonds[diamondIndex]) {
        return (
          <div className="diamond" style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            backgroundColor: '#f1c40f',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(241, 196, 15, 0.8)',
            animation: 'pulse-diamond 2s infinite ease-in-out'
          }}>
            <span style={{ filter: 'drop-shadow(0 0 5px #fff)' }}>💎</span>
          </div>
        );
      }
      
      // Other cell types
      switch (cellType) {
        case 0: return <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', border: '1px dashed #bdc3c7' }}></div>; // Empty
        case 1: return <div style={{ width: '100%', height: '100%', backgroundColor: '#566573', backgroundImage: 'linear-gradient(45deg, #4a5568 25%, #2c3e50 25%, #2c3e50 50%, #4a5568 50%, #4a5568 75%, #2c3e50 75%, #2c3e50 100%)', backgroundSize: '10px 10px' }}></div>; // Wall with pattern
        case 3: return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e74c3c', fontSize: '24px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)' }}>🏁</div>; // Goal with glow
        default: return null;
      }
    };
    
    const executeSingleCommand = async (cmd: string): Promise<void> => {
      const command = cmd.trim().toLowerCase();
      
      if (!command) {
        return;
      }
      
      // Parse and execute a single command
      if (command === 'collect') {
        const currentPosition = positionRef.current;
        const diamondIndex = diamondPositions.findIndex(d => d.x === currentPosition.x && d.y === currentPosition.y);
        if (diamondIndex !== -1) {
          collectDiamond(diamondIndex);
        } else {
          addToLog('There is nothing to collect here.');
        }
      } else if (command.startsWith('move ')) {
        const steps = parseInt(command.split(' ')[1]);
        if (isNaN(steps)) {
          addToLog('Invalid move command. Try "move 2".');
        } else {
          await move(steps);
        }
      } else if (command.startsWith('turn ')) {
        const dir = command.split(' ')[1];
        if (['up', 'down', 'left', 'right'].includes(dir)) {
          turn(dir);
          // Small delay to ensure state updates
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          addToLog('Invalid direction. Use up, down, left, or right.');
        }
      } else if (command.startsWith('say ')) {
        const message = command.substring(4).trim();
        if (message) {
          setSpeechBubble({ message, visible: true });
          addToLog(`Character says: "${message}"`);
          // Hide the speech bubble after 3 seconds
          setTimeout(() => {
            setSpeechBubble(prev => ({ ...prev, visible: false }));
          }, 3000);
        } else {
          addToLog('Please provide a message to say. Example: "say Hello!"');
        }
      } else {
        addToLog(`Unknown command: "${command}". Try move, turn, collect, or say.`);
      }
    };
    
    const executeCommand = async () => {
      const commandInput = document.getElementById('commandInput') as HTMLTextAreaElement;
      const input = commandInput.value.trim();
      
      if (!input) {
        addToLog('Please enter a command.');
        return;
      }
      
      // Clear the input
      commandInput.value = '';
      
      // Split commands by comma or newline
      const commands = input
        .split(/[,\n]/)
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);
      
      if (commands.length === 0) {
        addToLog('Please enter a valid command.');
        return;
      }
      
      // Track this command sequence for efficiency bonuses
      setCommandSequence(commands);
      setDiamondsCollectedThisSequence(0);
      
      // Execute commands sequentially with delays
      for (let i = 0; i < commands.length; i++) {
        await executeSingleCommand(commands[i]);
        // Add delay between commands to allow state updates
        if (i < commands.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Clear command sequence after execution (with small delay to allow diamond collection)
      setTimeout(() => {
        setCommandSequence([]);
        setDiamondsCollectedThisSequence(0);
      }, 500);
    };
    
    const backgroundStyle = character.background ? {
      background: character.background.value,
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    } : {};

    return (
      <ProtectedRoute>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', ...backgroundStyle }}>
          <Navigation />
          <div className="adventure-game" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: '20px' }}>
            <div style={{ marginBottom: '8px', flexShrink: 0 }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Code Adventure</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>Control your character with code to collect diamonds!</p>
            </div>
            
            {/* Diamond Celebration Modal */}
            {showDiamondCelebration && (
              <div className="reward-modal" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div className="reward-content" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  animation: 'bounce 0.5s ease-in-out'
                }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>💎</div>
                  <h2 style={{ color: '#3498db', marginTop: '0', fontSize: '2rem' }}>Diamond Collected!</h2>
                  <p style={{ fontSize: '1.2rem', color: '#666' }}>Awesome work! You found a diamond!</p>
                  <p style={{ fontSize: '1rem', color: '#27ae60', fontWeight: 'bold' }}>
                    +10 Coins | +15 XP | +25 Points
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '10px' }}>
                    Diamonds collected: {diamonds}/3
                  </p>
                </div>
              </div>
            )}
            
            {/* Reward Modal - Level Complete */}
            {showReward && (
              <div className="reward-modal" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001
              }}>
                <div className="reward-content" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  maxWidth: '500px'
                }}>
                  <h2 style={{ color: '#e74c3c', marginTop: '0', fontSize: '2.5rem' }}>🎉 Level Complete! 🎉</h2>
                  <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>
                    You've collected all 3 diamonds and completed the level!
                  </p>
                  <div className="reward-item-display" style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#9b59b6', fontSize: '1.5rem' }}>Reward Unlocked:</h3>
                    <div className="reward-item-card" style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '15px',
                      padding: '20px',
                      margin: '20px 0',
                      border: '3px solid #9b59b6'
                    }}>
                      <img 
                        src={rewardItem.image} 
                        alt={rewardItem.name} 
                        className="reward-item-image" 
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'contain',
                          marginBottom: '10px'
                        }}
                      />
                      <p className="reward-item-name" style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#9b59b6',
                        margin: '10px 0'
                      }}>{rewardItem.name}</p>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#27ae60', fontWeight: 'bold' }}>
                      +50 Coins | +100 XP | +{100 + (level * 25)} Points
                    </p>
                    <p style={{ fontSize: '1rem', color: '#666', marginTop: '15px' }}>
                      This item has been added to your inventory!
                    </p>
                    <button 
                      onClick={() => setShowReward(false)} 
                      style={{
                        marginTop: '20px',
                        padding: '12px 30px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      Continue Adventure
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            
            <div className="game-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '10px', overflow: 'hidden', minHeight: 0 }}>
              {/* Left Column - Instructions and Game Grid */}
              <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'visible', minHeight: 0 }}>
                {/* Instructions Panel - Collapsible */}
                <div className="instructions-panel" style={{ 
                  padding: '10px 12px',
                  overflowY: 'auto',
                  flexShrink: 0,
                  maxHeight: showHowToPlay ? '200px' : '40px',
                  transition: 'max-height 0.3s ease',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  borderLeft: '3px solid #27ae60'
                }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => setShowHowToPlay(!showHowToPlay)}
                  >
                    <h3 style={{ margin: 0, color: '#27ae60' }}>How to Play</h3>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      color: '#27ae60',
                      transition: 'transform 0.3s ease',
                      transform: showHowToPlay ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </span>
                  </div>
                  {showHowToPlay && (
                    <ol className="instruction-steps" style={{ marginTop: '10px', marginBottom: 0 }}>
                      <li>Type commands in the box on the right (you can use multiple commands separated by commas, like "turn right, move 2")</li>
                      <li>Use <code>move 2</code> to move 2 spaces forward</li>
                      <li>Use <code>turn right</code>, <code>turn left</code>, <code>turn up</code>, or <code>turn down</code> to change direction</li>
                      <li>Use <code>collect</code> when on a diamond to collect it</li>
                      <li>Use <code>say Hello!</code> to make your character say something in a speech bubble!</li>
                      <li>Collect all 3 diamonds to complete the level!</li>
                    </ol>
                  )}
                </div>
                
                {/* Game Grid */}
                <div className="game-grid-container" style={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#ebf5fb',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: 'inset 0 0 10px rgba(52, 152, 219, 0.2)',
                  overflow: 'auto',
                  minHeight: '300px',
                  position: 'relative',
                  marginTop: 'auto'
                }}>
                  <div className="game-grid" ref={gridRef} style={{ position: 'relative' }}>
                    {grid.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid-row">
                        {row.map((cell, cellIndex) => (
                          <div key={`${rowIndex}-${cellIndex}`} className="grid-cell" data-x={cellIndex} data-y={rowIndex}>
                            {renderCell(cell, cellIndex, rowIndex)}
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {/* Speech Bubble Overlay */}
                    {speechBubble.visible && bubblePosition && (
                      <div key="speech-bubble" style={{
                        position: 'absolute',
                        top: `${bubblePosition.top}px`,
                        left: `${bubblePosition.left}px`,
                        transform: 'translateX(-50%)',
                        backgroundColor: '#fff',
                        border: '3px solid #3498db',
                        borderRadius: '15px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        zIndex: 1000,
                        minWidth: '80px',
                        maxWidth: '150px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        textAlign: 'center',
                        animation: 'bounceIn 0.3s ease-out',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        pointerEvents: 'none'
                      }}>
                        {speechBubble.message}
                        {/* Speech bubble tail/pointer */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: '8px solid #3498db'
                        }}></div>
                        <div style={{
                          position: 'absolute',
                          bottom: '-5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '6px solid #fff'
                        }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Commands, Character, Status, Log */}
              <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'auto', minHeight: 0 }}>
                {/* Commands Panel */}
                <div className="command-panel" style={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '12px',
                  paddingBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  borderLeft: '3px solid #3498db',
                  flexShrink: 0,
                  overflow: 'visible'
                }}>
                  <h3>Commands</h3>
                  <div className="command-key" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    <div className="key-item" style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '3px', fontSize: '0.85rem' }}>move &lt;steps&gt;</div>
                    <div className="key-item" style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '3px', fontSize: '0.85rem' }}>turn &lt;direction&gt;</div>
                    <div className="key-item" style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '3px', fontSize: '0.85rem' }}>collect</div>
                    <div className="key-item" style={{ backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '3px', fontSize: '0.85rem' }}>say &lt;message&gt;</div>
                  </div>
                  <div className="command-input">
                    <div className="command-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'move 1\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        move 1
                      </button>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'move 2\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        move 2
                      </button>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'turn right\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        turn right
                      </button>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'turn left\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        turn left
                      </button>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'collect\n';
                          input.focus();
                        }}
                        className="command-quick-button collect-button"
                        style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        collect
                      </button>
                    </div>
                    <textarea 
                      id="commandInput" 
                      placeholder="Or type your own commands here..."
                      rows={3}
                      className="command-textarea"
                      style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd', fontSize: '0.9rem', fontFamily: 'monospace', resize: 'vertical' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          executeCommand();
                        }
                      }}
                    />
                    <div className="command-tip" style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>Tip: Press Enter to run your code! You can type multiple commands separated by commas (e.g., "turn right, move 2")</div>
                    <button 
                      onClick={executeCommand}
                      className="run-button"
                      style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '8px', width: '100%', cursor: 'pointer' }}
                    >
                      Run My Code!
                    </button>
                  </div>
                  
                  {/* Status and Log side by side */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    {/* Character and Pet display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 auto' }}>
                      {/* Character display */}
                      <div className="character-display-panel" style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '6px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #9b59b6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        width: '80px'
                      }}>
                        <div style={{
                          position: 'relative',
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f0f8ff',
                          borderRadius: '4px',
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
                              // Fallback to base character image
                              (e.target as HTMLImageElement).src = character.id === 'boy1' ? boyCharacter : girlCharacter;
                            }}
                          />
                        </div>
                        <div style={{
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '0.75rem',
                          textAlign: 'center'
                        }}>{character.name || 'Character'}</div>
                      </div>
                      
                      {/* Pet display - always visible */}
                      <div className="pet-display-panel" style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '6px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f39c12',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        width: '80px'
                      }}>
                        <div style={{
                          position: 'relative',
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#fff8e1',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px solid #f39c12',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {(() => {
                            const equippedPet = character.accessories?.find(acc => acc.type === 'pet' && acc.isEquipped);
                            if (equippedPet) {
                              // Show equipped pet image
                              if (equippedPet.image && (equippedPet.image.includes('.png') || equippedPet.image.includes('.jpg') || equippedPet.image.startsWith('/') || equippedPet.image.startsWith('http'))) {
                                return (
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
                                );
                              } else {
                                return <span style={{ fontSize: '30px' }}>{equippedPet.image || '🐾'}</span>;
                              }
                            } else {
                              // Show placeholder when no pet is equipped
                              return <span style={{ fontSize: '24px', opacity: 0.5 }}>🐾</span>;
                            }
                          })()}
                        </div>
                        <div style={{
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '0.7rem',
                          textAlign: 'center'
                        }}>
                          {(() => {
                            const equippedPet = character.accessories?.find(acc => acc.type === 'pet' && acc.isEquipped);
                            return equippedPet ? equippedPet.name : 'Pet';
                          })()}
                        </div>
                      </div>
                      
                      {/* Accessories display */}
                      {equippedAccessories.map((accessory, idx) => (
                        <div key={accessory.id || idx} className="accessory-display-panel" style={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          padding: '6px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #9b59b6',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          width: '80px'
                        }}>
                          <div style={{
                            position: 'relative',
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#f0f8ff',
                            borderRadius: '4px',
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
                              <span style={{ fontSize: '30px' }}>{accessory.image || '✨'}</span>
                            )}
                          </div>
                          <div style={{
                            fontWeight: 'bold',
                            color: '#333',
                            fontSize: '0.7rem',
                            textAlign: 'center'
                          }}>
                            {accessory.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Status Panel */}
                    <div className="status-panel" style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 10px 12px 10px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #3498db',
                      overflow: 'visible',
                      flex: 1
                    }}>
                      <h3 style={{ 
                        fontSize: '0.9rem', 
                        marginTop: '0', 
                        marginBottom: '6px', 
                        color: '#2874a6', 
                        borderBottom: '2px solid #aed6f1',
                        paddingBottom: '3px'
                      }}>Status</h3>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Level:</span>
                        <span style={{ color: '#2980b9' }}>{level}</span>
                      </div>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Position:</span>
                        <span style={{ color: '#2980b9' }}>({position.x}, {position.y})</span>
                      </div>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Direction:</span>
                        <span style={{ color: '#2980b9' }}>{direction}</span>
                      </div>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Diamonds:</span>
                        <span style={{ 
                          color: diamonds > 0 ? '#e67e22' : '#2980b9',
                          fontWeight: diamonds > 0 ? 'bold' : 'bold'
                        }}>{diamonds}/3</span>
                      </div>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Coins:</span>
                        <span style={{ color: '#f39c12', fontWeight: 'bold' }}>🪙 {character.coins || 0}</span>
                      </div>
                      <div className="status-item" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        <span style={{ color: '#333' }}>Points:</span>
                        <span style={{ color: '#9b59b6', fontWeight: 'bold' }}>🏆 {character.points || 0}</span>
                      </div>
                    </div>
                    
                    {/* Log Panel */}
                    <div className="log-panel" style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      flex: 1
                    }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>Log</h3>
                      <div className="log-content" style={{
                        height: '100px',
                        overflowY: 'auto',
                        padding: '4px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {log.map((entry, index) => (
                          <div key={index} className="log-entry" style={{
                            marginBottom: '2px',
                            padding: '2px',
                            borderLeft: '2px solid #3498db'
                          }}>{entry}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error rendering AdventurePage:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>There was an error loading the adventure game.</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
}

export default AdventurePage;
