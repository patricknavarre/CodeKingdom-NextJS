'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacter, type Accessory, type AccessoryType } from '@/contexts/CharacterContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getLevelConfig, getMaxLevel, type LevelConfig } from './utils/levelConfigs';
import '@/styles/AdventureGamePage.css';

// Image paths for Next.js public folder
const pinkHoodie = '/images/items/Pink_Hoodie.png';
const whiteSneakers = '/images/items/WhiteSneakers.png';
const stanleyBlue = '/images/items/Accessory_Stanley_Blue.png';
const owallaPink = '/images/items/Accessory_Owalla_Pink.png';
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const blondeBoyCharacter = '/images/characters/Boy_Character_BlondeHair_NEW.png'; // new blonde boy base
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
      if (character.id === 'blonde-boy1') return blondeBoyCharacter;
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
    
    const [diamonds, setDiamonds] = useState(0);
    const [log, setLog] = useState(['Welcome to the adventure!']);
    const [level, setLevel] = useState(1);
    
    // Get initial position and direction from level config (use level 1 as default)
    const getInitialConfig = () => {
      return getLevelConfig(1)!;
    };

    // Game state - initialized from level config
    const initialConfig = getInitialConfig();
    const [position, setPosition] = useState(initialConfig.startPosition);
    // Use a ref to track position synchronously (for immediate use in move function)
    const positionRef = useRef(initialConfig.startPosition);
    
    const [direction, setDirection] = useState(initialConfig.startDirection);
    // Use a ref to track direction synchronously (for immediate use in move function)
    const directionRef = useRef(initialConfig.startDirection);
    const [showReward, setShowReward] = useState(false);
    const [showDiamondCelebration, setShowDiamondCelebration] = useState(false);
    const [commandSequence, setCommandSequence] = useState<string[]>([]);
    const [diamondsCollectedThisSequence, setDiamondsCollectedThisSequence] = useState(0);
    
    // Block system state
    interface Block {
      id: string;
      type: 'move' | 'turn' | 'collect' | 'say';
      value?: string | number; // for move steps, turn direction, or say message
      x: number;
      y: number;
      connectedTo?: string; // id of block this is connected to
    }
    
    const [connectedBlocks, setConnectedBlocks] = useState<Block[]>([]);
    const [draggedBlock, setDraggedBlock] = useState<{ type: string; value?: string | number } | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [snapTarget, setSnapTarget] = useState<string | null>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    
    // Sound effect for block snapping
    const playSnapSound = () => {
      try {
        // Create audio context (may need user interaction first)
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        // Resume audio context in case it's suspended (requires user interaction)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Fallback if audio context fails
        console.log('Audio not available:', e);
      }
    };
    
    // Helper to get client coordinates from event (works for both mouse and touch)
    const getClientCoordinates = (e: React.DragEvent | React.TouchEvent | React.MouseEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      if ('changedTouches' in e && e.changedTouches.length > 0) {
        return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
      }
      if ('clientX' in e && 'clientY' in e) {
        return { clientX: e.clientX, clientY: e.clientY };
      }
      return { clientX: 0, clientY: 0 };
    };
    
    // Block drag handlers (mouse)
    const handleBlockDragStart = (e: React.DragEvent, type: string, value?: string | number) => {
      setDraggedBlock({ type, value });
      e.dataTransfer.effectAllowed = 'move';
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
      }
    };
    
    const handleBlockDrag = (e: React.DragEvent) => {
      if (!draggedBlock || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const coords = getClientCoordinates(e);
      setDragPosition({
        x: coords.clientX - rect.left,
        y: coords.clientY - rect.top
      });
      
      // Check for snap targets (horizontal - left to right)
      const SNAP_DISTANCE = 60;
      let closestBlock: Block | null = null;
      let minDistance = Infinity;
      
      for (const block of connectedBlocks) {
        const blockX = block.x;
        const blockY = block.y;
        // Check both horizontal distance (for snapping) and vertical alignment
        const horizontalDistance = Math.abs(coords.clientX - rect.left - (blockX + 120)); // 120 = block width + gap
        const verticalDistance = Math.abs(coords.clientY - rect.top - blockY);
        // Snap if horizontally close to the right edge of a block AND vertically aligned
        if (horizontalDistance < SNAP_DISTANCE && verticalDistance < 30 && horizontalDistance < minDistance) {
          minDistance = horizontalDistance;
          closestBlock = block;
        }
      }
      
      setSnapTarget(closestBlock?.id || null);
    };
    
    // Touch event handlers for mobile
    const handleBlockTouchStart = (e: React.TouchEvent, type: string, value?: string | number) => {
      e.preventDefault(); // Prevent scrolling
      setDraggedBlock({ type, value });
      const coords = getClientCoordinates(e);
      if (workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        setDragPosition({
          x: coords.clientX - rect.left,
          y: coords.clientY - rect.top
        });
      }
    };
    
    const handleBlockTouchMove = (e: React.TouchEvent) => {
      if (!draggedBlock || !workspaceRef.current) return;
      e.preventDefault(); // Prevent scrolling
      const rect = workspaceRef.current.getBoundingClientRect();
      const coords = getClientCoordinates(e);
      setDragPosition({
        x: coords.clientX - rect.left,
        y: coords.clientY - rect.top
      });
      
      // Check for snap targets (horizontal - left to right)
      const SNAP_DISTANCE = 60;
      let closestBlock: Block | null = null;
      let minDistance = Infinity;
      
      for (const block of connectedBlocks) {
        const blockX = block.x;
        const blockY = block.y;
        const horizontalDistance = Math.abs(coords.clientX - rect.left - (blockX + 120));
        const verticalDistance = Math.abs(coords.clientY - rect.top - blockY);
        if (horizontalDistance < SNAP_DISTANCE && verticalDistance < 30 && horizontalDistance < minDistance) {
          minDistance = horizontalDistance;
          closestBlock = block;
        }
      }
      
      setSnapTarget(closestBlock?.id || null);
    };
    
    const handleBlockTouchEnd = (e: React.TouchEvent) => {
      if (!draggedBlock || !workspaceRef.current) return;
      e.preventDefault();
      const rect = workspaceRef.current.getBoundingClientRect();
      const coords = getClientCoordinates(e);
      handleBlockDropAtPosition(coords.clientX - rect.left, coords.clientY - rect.top);
    };
    
    // Shared drop logic for both mouse and touch
    const handleBlockDropAtPosition = (dropX: number, dropY: number) => {
      if (!draggedBlock || !workspaceRef.current) return;
      
      const SNAP_DISTANCE = 60;
      const BLOCK_WIDTH = 120; // Approximate block width + gap
      const BLOCK_HEIGHT = 50; // Block height + gap for wrapping
      const WORKSPACE_PADDING = 30; // Padding on left and right
      const workspaceWidth = workspaceRef.current.clientWidth - WORKSPACE_PADDING;
      
      let snapToBlock: Block | null = null;
      let minDistance = Infinity;
      
      for (const block of connectedBlocks) {
        const horizontalDistance = Math.abs(dropX - (block.x + BLOCK_WIDTH));
        const verticalDistance = Math.abs(dropY - block.y);
        // Snap if horizontally close to right edge AND vertically aligned
        if (horizontalDistance < SNAP_DISTANCE && verticalDistance < 30 && horizontalDistance < minDistance) {
          minDistance = horizontalDistance;
          snapToBlock = block;
        }
      }
      
      // Calculate position: if snapping, place to the right; otherwise append to end of chain
      let newX: number;
      let newY: number;
      const BASE_Y = 20; // Starting Y position
      
      if (snapToBlock) {
        // Snap to the right of the target block
        const proposedX = snapToBlock.x + BLOCK_WIDTH;
        
        // Check if this would extend past the workspace width
        if (proposedX + BLOCK_WIDTH > workspaceWidth) {
          // Wrap to new line: start at left edge, one line down
          newX = 20;
          newY = snapToBlock.y + BLOCK_HEIGHT;
        } else {
          // Place to the right on same line
          newX = proposedX;
          newY = snapToBlock.y;
        }
      } else {
        // If no blocks exist, start at left edge
        if (connectedBlocks.length === 0) {
          newX = 20;
          newY = BASE_Y;
        } else {
          // Find the last block in the chain (rightmost connected block)
          // Start from first block and follow connections
          const firstBlock = connectedBlocks.find(b => 
            !connectedBlocks.some(other => other.connectedTo === b.id)
          ) || connectedBlocks[0];
          
          let lastBlock = firstBlock;
          let current: Block | undefined = firstBlock;
          while (current) {
            // Find the block that current connects TO (next in chain)
            const next: Block | undefined = current.connectedTo
              ? connectedBlocks.find(b => b.id === current!.connectedTo)
              : undefined;
            if (next) {
              lastBlock = next;
              current = next;
            } else {
              break;
            }
          }
          
          // Check if placing to the right would extend past workspace
          const proposedX = lastBlock.x + BLOCK_WIDTH;
          if (proposedX + BLOCK_WIDTH > workspaceWidth) {
            // Wrap to new line
            newX = 20;
            newY = lastBlock.y + BLOCK_HEIGHT;
          } else {
            // Place to the right on same line
            newX = proposedX;
            newY = lastBlock.y;
          }
        }
      }
      
      const newBlock: Block = {
        id: `block-${Date.now()}-${Math.random()}`,
        type: draggedBlock.type as 'move' | 'turn' | 'collect' | 'say',
        value: draggedBlock.value,
        x: newX,
        y: newY
      };
      
      setConnectedBlocks(prev => {
        if (snapToBlock) {
          // When snapping: target block connects TO new block (target → new)
          // Find what the target was connected to, and connect new block to that
          const targetWasConnectedTo = snapToBlock.connectedTo;
          newBlock.connectedTo = targetWasConnectedTo;
          
          // Update target to connect to new block
          const updated = prev.map(b => {
            if (b.id === snapToBlock!.id) {
              return { ...b, connectedTo: newBlock.id };
            }
            return b;
          });
          
          // Insert new block after target
          const index = updated.findIndex(b => b.id === snapToBlock!.id);
          const newBlocks = [...updated];
          newBlocks.splice(index + 1, 0, newBlock);
          
          playSnapSound();
          return newBlocks;
        } else {
          // When not snapping: connect to the last block in the chain
          if (prev.length > 0) {
            // Find the last block in the chain
            const firstBlock = prev.find(b => 
              !prev.some(other => other.connectedTo === b.id)
            ) || prev[0];
            
            let lastBlock = firstBlock;
            let current: Block | undefined = firstBlock;
            while (current) {
              const next = prev.find(b => b.id === current!.connectedTo);
              if (next) {
                lastBlock = next;
                current = next;
              } else {
                break;
              }
            }
            
            // Connect the last block to the new block
            return prev.map(b => {
              if (b.id === lastBlock.id) {
                return { ...b, connectedTo: newBlock.id };
              }
              return b;
            }).concat(newBlock);
          }
          // First block, no connection needed
          return [...prev, newBlock];
        }
      });
      
      setDraggedBlock(null);
      setSnapTarget(null);
    };
    
    const handleBlockDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedBlock || !workspaceRef.current) return;
      
      const rect = workspaceRef.current.getBoundingClientRect();
      const coords = getClientCoordinates(e);
      handleBlockDropAtPosition(coords.clientX - rect.left, coords.clientY - rect.top);
    };
    
    const handleBlockDelete = (blockId: string) => {
      setConnectedBlocks(prev => {
        const block = prev.find(b => b.id === blockId);
        if (!block) return prev;
        
        const connectedToId = block.connectedTo;
        
        // Remove this block and update connections
        const filtered = prev.filter(b => b.id !== blockId);
        return filtered.map(b => {
          if (b.connectedTo === blockId) {
            return { ...b, connectedTo: connectedToId };
          }
          return b;
        });
      });
    };
    
    const clearAllBlocks = () => {
      setConnectedBlocks([]);
    };
    
    // Convert connected blocks to command sequence
    const blocksToCommands = (): string[] => {
      if (connectedBlocks.length === 0) return [];
      
      // Find the first block (one with no incoming connection - no other block points to it)
      const firstBlock = connectedBlocks.find(b => 
        !connectedBlocks.some(other => other.connectedTo === b.id)
      ) || connectedBlocks[0];
      
      if (!firstBlock) return [];
      
      const commands: string[] = [];
      let current: Block | undefined = firstBlock;
      const visited = new Set<string>(); // Prevent infinite loops
      
      while (current && !visited.has(current.id)) {
        visited.add(current.id);
        
        let cmd = '';
        if (current.type === 'move') {
          cmd = `move ${current.value || 1}`;
        } else if (current.type === 'turn') {
          cmd = `turn ${current.value || 'right'}`;
        } else if (current.type === 'collect') {
          cmd = 'collect';
        } else if (current.type === 'say') {
          cmd = `say ${current.value || 'Hello!'}`;
        }
        commands.push(cmd);
        
        // Find next block: the one whose id matches current.connectedTo
        // (current connects TO next, so next's id = current.connectedTo)
        const nextBlock: Block | undefined = current.connectedTo 
          ? connectedBlocks.find(b => b.id === current!.connectedTo)
          : undefined;
        current = nextBlock;
      }
      
      return commands;
    };
    
    // Load saved level from localStorage so players resume where they left off
    useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
        const saved = window.localStorage.getItem('codegrid-current-level');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            setLevel(parsed);
          }
        }
      } catch (e) {
        console.warn('Unable to load saved Code Grid Adventure level:', e);
      }
    }, []);

    // Persist level whenever it changes
    useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem('codegrid-current-level', String(level));
      } catch (e) {
        console.warn('Unable to save Code Grid Adventure level:', e);
      }
    }, [level]);

    // Reset game state when level changes
    useEffect(() => {
      const levelConfig = getLevelConfig(level);
      if (levelConfig) {
        // Reset position and direction
        positionRef.current = levelConfig.startPosition;
        setPosition(levelConfig.startPosition);
        directionRef.current = levelConfig.startDirection;
        setDirection(levelConfig.startDirection);
        
        // Reset diamonds
        setDiamonds(0);
        setCollectedDiamonds(new Array(levelConfig.diamondPositions.length).fill(false));
        
        // Clear blocks
        setConnectedBlocks([]);
        
        // Clear log
        setLog(['Welcome to the adventure!']);
      }
    }, [level]);

    // Determine reward based on level
    // Note: Level 1 no longer grants the Pink Hoodie (available in the shop instead).
    const getRewardForLevel = (currentLevel: number) => {
      if (currentLevel === 2) {
        return { name: 'White Sneakers', image: whiteSneakers };
      }
      if (currentLevel === 3) {
        return { name: 'Stanley Blue Water Bottle', image: stanleyBlue };
      }
      if (currentLevel === 4) {
        return { name: 'Owalla Pink Water Bottle', image: owallaPink };
      }
      // Generic reward display for levels without an item reward
      return { name: 'Level Complete', image: pinkHoodie };
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
    
    // Get current level configuration
    const currentLevelConfig = getLevelConfig(level) || getLevelConfig(1)!;
    
    // Game grid from level config
    // 0 = empty, 1 = wall, 2 = diamond, 3 = goal
    const grid = currentLevelConfig.grid;
    
    // Diamond positions for collection logic
    const diamondPositions = currentLevelConfig.diamondPositions;
    
    // Track collected diamonds (dynamic based on level)
    const [collectedDiamonds, setCollectedDiamonds] = useState<boolean[]>(
      new Array(diamondPositions.length).fill(false)
    );
    
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
        
        // Check boundaries and walls (use dynamic grid size)
        const gridHeight = grid.length;
        const gridWidth = grid[0]?.length || 0;
        if (newX < 0 || newX >= gridWidth || newY < 0 || newY >= gridHeight || grid[newY][newX] === 1) {
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
          // Check for diamonds, but DON'T auto-collect
          const diamondIndex = diamondPositions.findIndex(d => d.x === newX && d.y === newY);
          if (diamondIndex !== -1 && !collectedDiamonds[diamondIndex]) {
            addToLog('You are standing on a diamond! Use "collect" to pick it up.');
          }
          
          // Check for goal flag (🏁)
          if (grid[newY][newX] === 3) {
            const totalDiamonds = diamondPositions.length;
            if (diamonds === totalDiamonds) {
              completeLevel();
            } else {
              addToLog(`You found the finish flag, but you need all ${totalDiamonds} diamonds before you can finish the level.`);
            }
          }
          
          resolve();
        }, 200);
      });
    };
    
    const turn = (newDirection: string) => {
      // Validate direction
      if (!['up', 'down', 'left', 'right'].includes(newDirection)) {
        addToLog(`Invalid direction: ${newDirection}`);
        return;
      }
      // Update both state and ref immediately
      const dir = newDirection as 'up' | 'down' | 'left' | 'right';
      directionRef.current = dir;
      setDirection(dir);
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
      
      // If all diamonds are collected, prompt player to reach the flag instead of auto-completing
      const totalDiamonds = diamondPositions.length;
      if (newDiamondCount === totalDiamonds) {
        addToLog(`Great job! You collected all ${totalDiamonds} diamonds. Now move to the finish flag (🏁) to complete the level.`);
      }
    };
    
    const completeLevel = () => {
      // Safety check: only allow completion when all diamonds are collected
      const totalDiamonds = diamondPositions.length;
      if (diamonds < totalDiamonds) {
        addToLog(`You need all ${totalDiamonds} diamonds before you can finish the level.`);
        return;
      }
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
      
      // Only add item if player doesn't already have it and this level has an item reward
      // Note: Level 1 no longer grants a Pink Hoodie; rewards are coins/XP only.
      if (!alreadyHasItem && (level === 2 || level === 3 || level === 4)) {
        addToLog(`You received ${currentReward.name}! 🎁`);
        
        // Show reward modal
        setShowReward(true);
        
        // Add the reward item to the character's inventory
        let newAccessory: Accessory;
        if (level === 2) {
          newAccessory = {
            id: 'white-sneakers-' + Date.now(),
            name: 'White Sneakers',
            type: 'tool' as const,
            image: whiteSneakers,
            description: 'Cool white sneakers earned from the Code Grid Adventure game',
            rarity: 'rare' as const,
            isEquipped: false,
            source: 'adventure' as const
          };
        } else if (level === 3) {
          // Level 3 - Stanley Blue Water Bottle
          newAccessory = {
            id: 'stanley-blue-' + Date.now(),
            name: 'Stanley Blue Water Bottle',
            type: 'tool' as const,
            image: stanleyBlue,
            description: 'Stay hydrated in style! Earned from the Code Grid Adventure game',
            rarity: 'rare' as const,
            isEquipped: false,
            source: 'adventure' as const
          };
        } else {
          // Level 4 - Owalla Pink Water Bottle
          newAccessory = {
            id: 'owalla-pink-' + Date.now(),
            name: 'Owalla Pink Water Bottle',
            type: 'tool' as const,
            image: owallaPink,
            description: 'A super cute pink Owalla bottle—earned from the Code Grid Adventure game!',
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
        const nextLevel = level + 1;
        const maxLevel = getMaxLevel();
        
        // Only advance if there's a next level
        if (nextLevel <= maxLevel) {
          setLevel(nextLevel);
          const nextLevelConfig = getLevelConfig(nextLevel);
          if (nextLevelConfig) {
            // Reset position and direction for new level
            const resetPos = nextLevelConfig.startPosition;
            positionRef.current = resetPos;
            setPosition(resetPos);
            directionRef.current = nextLevelConfig.startDirection;
            setDirection(nextLevelConfig.startDirection);
            
            // Reset diamonds for new level
            setDiamonds(0);
            setCollectedDiamonds(new Array(nextLevelConfig.diamondPositions.length).fill(false));
          }
        } else {
          // All levels completed!
          addToLog('🎉 Congratulations! You completed all levels!');
        }
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
      // First try to use connected blocks
      const blockCommands = blocksToCommands();
      let commands: string[] = [];
      
      if (blockCommands.length > 0) {
        commands = blockCommands;
      } else {
        // Fallback to text input
        const commandInput = document.getElementById('commandInput') as HTMLTextAreaElement;
        const input = commandInput?.value.trim() || '';
        
        if (!input) {
          addToLog('Please connect some blocks or enter a command.');
          return;
        }
        
        // Clear the input
        if (commandInput) commandInput.value = '';
        
        // Split commands by comma or newline
        commands = input
          .split(/[,\n]/)
          .map(cmd => cmd.trim())
          .filter(cmd => cmd.length > 0);
      }
      
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Code Grid Adventure</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1rem', color: '#667eea', fontWeight: 'bold' }}>
                    Level {level}: {currentLevelConfig.title}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Level {level} of {getMaxLevel()}</p>
                </div>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>{currentLevelConfig.description}</p>
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
                    You've collected all {diamondPositions.length} diamonds and completed {currentLevelConfig.title}!
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
            
            
            <div className="game-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '10px', overflow: 'auto', minHeight: 0 }}>
              {/* Left Column - Instructions and Game Grid */}
              <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'auto', minHeight: 0 }}>
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
                      <li>Collect all {diamondPositions.length} diamonds to complete the level!</li>
                    </ol>
                  )}
                </div>
                
                {/* Game Grid */}
                <div className="game-grid-container" style={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  backgroundColor: '#ebf5fb',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: 'inset 0 0 10px rgba(52, 152, 219, 0.2)',
                  overflow: 'auto',
                  minHeight: '300px',
                  position: 'relative'
                }}>
                  <div 
                    className="game-grid" 
                    ref={gridRef} 
                    style={{ 
                      position: 'relative', 
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 28px)`,
                      gridTemplateRows: `repeat(${grid.length}, 28px)`,
                      gap: '1px',
                      backgroundColor: '#3498db',
                      borderRadius: '6px',
                      padding: '3px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      width: 'fit-content',
                      border: '2px solid #3498db'
                    }}
                  >
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
                  <h3>Drag & Connect Blocks</h3>
                  <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#666' }}>
                    Drag blocks from the palette below into the workspace. They'll snap together with a satisfying click! 🧲
                  </div>
                  
                  {/* Block Palette */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginBottom: '12px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '2px dashed #bdc3c7'
                  }}>
                    {/* Move blocks */}
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'move', 1)}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'move', 1)}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      move 1
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'move', 2)}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'move', 2)}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      move 2
                    </div>
                    {/* Turn blocks */}
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'turn', 'right')}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'turn', 'right')}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      turn right
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'turn', 'left')}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'turn', 'left')}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      turn left
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'turn', 'up')}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'turn', 'up')}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      turn up
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'turn', 'down')}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'turn', 'down')}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      turn down
                    </div>
                    {/* Collect block */}
                    <div
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, 'collect')}
                      onTouchStart={(e) => handleBlockTouchStart(e, 'collect')}
                      onTouchMove={handleBlockTouchMove}
                      onTouchEnd={handleBlockTouchEnd}
                      className="block-palette-item"
                      style={{
                        backgroundColor: '#f39c12',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      collect
                    </div>
                  </div>
                  
                  {/* Workspace for connected blocks */}
                  <div
                    ref={workspaceRef}
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleBlockDrag(e);
                    }}
                    onDrop={handleBlockDrop}
                    onTouchMove={(e) => {
                      if (draggedBlock) {
                        handleBlockTouchMove(e);
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (draggedBlock) {
                        handleBlockTouchEnd(e);
                      }
                    }}
                    style={{
                      minHeight: '150px',
                      backgroundColor: '#fff',
                      border: '2px dashed #3498db',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '12px',
                      position: 'relative',
                      touchAction: 'none',
                      overflow: 'visible' // Ensure connector lines are visible
                    }}
                  >
                    {connectedBlocks.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#999', 
                        padding: '40px',
                        fontSize: '0.9rem'
                      }}>
                        Drag blocks here to build your program! 🧩
                      </div>
                    ) : (
                      <>
                        {connectedBlocks.map((block) => {
                          const getBlockColor = () => {
                            if (block.type === 'move') return '#3498db';
                            if (block.type === 'turn') return '#9b59b6';
                            if (block.type === 'collect') return '#f39c12';
                            return '#2ecc71';
                          };
                          
                          const getBlockText = () => {
                            if (block.type === 'move') return `move ${block.value || 1}`;
                            if (block.type === 'turn') return `turn ${block.value || 'right'}`;
                            if (block.type === 'collect') return 'collect';
                            return `say ${block.value || 'Hello!'}`;
                          };
                          
                          return (
                            <React.Fragment key={block.id}>
                              {/* Block */}
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${block.x}px`,
                                  top: `${block.y}px`,
                                  backgroundColor: getBlockColor(),
                                  color: 'white',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                  cursor: 'move',
                                  boxShadow: snapTarget === block.id 
                                    ? '0 0 15px rgba(52, 152, 219, 0.8)' 
                                    : '0 3px 6px rgba(0,0,0,0.3)',
                                  transform: snapTarget === block.id ? 'scale(1.05)' : 'scale(1)',
                                  transition: 'all 0.2s ease',
                                  zIndex: snapTarget === block.id ? 10 : 5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  minWidth: '100px',
                                  whiteSpace: 'nowrap',
                                  width: '100px', // Fixed width so blocks align perfectly
                                  boxSizing: 'border-box' // Include padding in width
                                }}
                              >
                                <span>{getBlockText()}</span>
                                <button
                                  onClick={() => handleBlockDelete(block.id)}
                                  style={{
                                    background: 'rgba(255,255,255,0.3)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    marginLeft: 'auto'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                  
                  {connectedBlocks.length > 0 && (
                    <button
                      onClick={clearAllBlocks}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '5px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      Clear All Blocks
                    </button>
                  )}
                  
                  {/* Run My Code button - between drag section and command buttons */}
                  <button 
                    onClick={executeCommand}
                    className="run-button"
                    style={{ 
                      backgroundColor: '#2ecc71', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '8px', 
                      fontSize: '1rem', 
                      fontWeight: 'bold', 
                      marginTop: '12px',
                      marginBottom: '12px',
                      width: '100%', 
                      cursor: 'pointer',
                      boxShadow: '0 4px 8px rgba(46, 204, 113, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(46, 204, 113, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(46, 204, 113, 0.3)';
                    }}
                  >
                    Run My Code! 🚀
                  </button>
                  
                  {/* Fallback text input */}
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
                          input.value += 'turn up\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        turn up
                      </button>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('commandInput') as HTMLTextAreaElement;
                          input.value += 'turn down\n';
                          input.focus();
                        }}
                        className="command-quick-button"
                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        turn down
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
                    <div className="command-tip" style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>
                      Tip: You can **click the command buttons above** or **type your own commands** (separate multiple commands with commas, e.g. "turn right, move 2").
                    </div>
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
