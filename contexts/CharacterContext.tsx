'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

// Types for accessories and character data
export type AccessoryType = 'hat' | 'glasses' | 'tool' | 'pet' | 'badge' | 'background';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  image: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isEquipped: boolean;
  source: 'quiz' | 'adventure' | 'default' | 'store';
  backgroundData?: Background; // For backgrounds stored as accessories
}

export interface Background {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image';
  value: string; // CSS value: color name, gradient, or image URL
  thumbnail?: string; // Preview image for image backgrounds
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Character {
  id: string;
  name: string;
  image: string;
  accessories: Accessory[];
  background?: Background | null; // Currently equipped background
  coins: number;
  experience: number;
  level: number;
  points: number;
}

// Default accessories
const defaultAccessories: Accessory[] = [
  {
    id: 'default-glasses',
    name: 'Basic Glasses',
    type: 'glasses',
    image: '👓',
    description: 'Simple glasses for coding',
    rarity: 'common',
    isEquipped: false,
    source: 'default'
  },
  {
    id: 'default-hat',
    name: 'Coding Cap',
    type: 'hat',
    image: '🧢',
    description: 'A cap for beginner coders',
    rarity: 'common',
    isEquipped: false,
    source: 'default'
  }
];

// Context interface
interface CharacterContextType {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  updateCharacterName: (name: string) => void;
  addAccessory: (accessory: Accessory) => void;
  toggleAccessory: (accessoryId: string) => void;
  setBackground: (background: Background | null) => void;
  addCoins: (amount: number) => void;
  addExperience: (amount: number) => void;
  addPoints: (amount: number) => void;
  getEquippedAccessories: () => Accessory[];
}

// Create context with default values
const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// Default character
const defaultCharacter: Character = {
  id: 'girl1',
  name: 'Coder',
  image: '',
  accessories: [...defaultAccessories],
  coins: 0,
  experience: 0,
  level: 1,
  points: 0
};

// Provider component
export const CharacterProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(defaultCharacter);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load character data on mount
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (token) {
          // Try to load from backend
          try {
            const response = await authAPI.getProfile();
            const userData = response.data;
            
            if (userData.characterName || userData.characterAccessories) {
              // User has character data in backend
              setIsAuthenticated(true);
              setCharacter({
                id: userData.characterId || defaultCharacter.id,
                name: userData.characterName || defaultCharacter.name,
                image: userData.characterImage || defaultCharacter.image,
                accessories: userData.characterAccessories || defaultCharacter.accessories,
                coins: userData.coins || 0,
                experience: userData.experience || 0,
                level: userData.level || 1,
                points: userData.points || 0,
              });
            } else {
              // No character data in backend, try localStorage
              const saved = typeof window !== 'undefined' ? localStorage.getItem('character') : null;
              if (saved) {
                const localCharacter = JSON.parse(saved);
                setCharacter(localCharacter);
                // Sync to backend
                await syncToBackend(localCharacter);
              }
              setIsAuthenticated(true);
            }
          } catch (error) {
            // Backend failed, use localStorage
            console.log('Backend not available, using localStorage');
            const saved = typeof window !== 'undefined' ? localStorage.getItem('character') : null;
            if (saved) {
              setCharacter(JSON.parse(saved));
            }
            setIsAuthenticated(false);
          }
        } else {
          // No token, use localStorage
          const saved = typeof window !== 'undefined' ? localStorage.getItem('character') : null;
          if (saved) {
            setCharacter(JSON.parse(saved));
          }
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading character:', error);
        // Fallback to localStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('character') : null;
        if (saved) {
          setCharacter(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
    
    // Also listen for token changes (when user logs in/out)
    const handleStorageChange = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && !isAuthenticated) {
        // User just logged in, reload character
        loadCharacter();
      } else if (!token && isAuthenticated) {
        // User logged out, reset to default
        setCharacter(defaultCharacter);
        setIsAuthenticated(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Sync character to backend or localStorage
  const syncToBackend = async (charData: Character) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      try {
        await authAPI.updateCharacter({
          characterId: charData.id,
          characterName: charData.name,
          characterImage: charData.image,
          characterAccessories: charData.accessories,
          coins: charData.coins,
          experience: charData.experience,
          level: charData.level,
          points: charData.points || 0,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error syncing to backend:', error);
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('character', JSON.stringify(charData));
        }
      }
    } else {
      // No auth, save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('character', JSON.stringify(charData));
      }
    }
  };

  // Save character whenever it changes (with debounce to prevent excessive API calls)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        syncToBackend(character);
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [character, isLoading]);

  // Update character name
  const updateCharacterName = (name: string) => {
    setCharacter(prev => ({
      ...prev,
      name
    }));
  };

  // Add a new accessory
  const addAccessory = (accessory: Accessory) => {
    // Check if accessory with same name already exists (prevent duplicates)
    if (character.accessories.some(a => a.name === accessory.name && a.source === accessory.source)) {
      console.log(`Accessory ${accessory.name} already exists, skipping duplicate`);
      return;
    }
    
    setCharacter(prev => ({
      ...prev,
      accessories: [...prev.accessories, accessory]
    }));
  };
  
  // Remove duplicate accessories on mount (keep the first one of each name+source combination)
  useEffect(() => {
    setCharacter(prev => {
      const seen = new Set<string>();
      const uniqueAccessories = prev.accessories.filter(acc => {
        const key = `${acc.name}-${acc.source}`;
        if (seen.has(key)) {
          return false; // Duplicate, remove it
        }
        seen.add(key);
        return true; // Keep first occurrence
      });
      
      if (uniqueAccessories.length !== prev.accessories.length) {
        console.log(`Removed ${prev.accessories.length - uniqueAccessories.length} duplicate accessories`);
        return {
          ...prev,
          accessories: uniqueAccessories
        };
      }
      return prev;
    });
  }, []); // Only run once on mount

  // Toggle equipping an accessory
  const toggleAccessory = (accessoryId: string) => {
    setCharacter(prev => {
      const newAccessories = prev.accessories.map(acc => {
        // If this is the accessory we want to toggle
        if (acc.id === accessoryId) {
          return { ...acc, isEquipped: !acc.isEquipped };
        }
        
        // If we're equipping an accessory, unequip others of the same type
        if (acc.id !== accessoryId && !acc.isEquipped) {
          const toggledAccessory = prev.accessories.find(a => a.id === accessoryId);
          if (toggledAccessory && acc.type === toggledAccessory.type) {
            return { ...acc, isEquipped: false };
          }
        }
        
        return acc;
      });
      
      return {
        ...prev,
        accessories: newAccessories
      };
    });
  };

  // Set background
  const setBackground = (background: Background | null) => {
    setCharacter(prev => ({
      ...prev,
      background
    }));
  };

  // Add coins
  const addCoins = (amount: number) => {
    setCharacter(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  // Add experience and level up if needed
  const addExperience = (amount: number) => {
    setCharacter(prev => {
      const newExp = prev.experience + amount;
      const expNeededForNextLevel = prev.level * 100;
      
      // Check if we should level up
      if (newExp >= expNeededForNextLevel) {
        return {
          ...prev,
          experience: newExp - expNeededForNextLevel,
          level: prev.level + 1,
          coins: prev.coins + 50 // Bonus coins for leveling up
        };
      }
      
      return {
        ...prev,
        experience: newExp
      };
    });
  };

  // Add points (skill/performance points)
  const addPoints = (amount: number) => {
    setCharacter(prev => ({
      ...prev,
      points: (prev.points || 0) + amount
    }));
  };

  // Get all equipped accessories
  const getEquippedAccessories = (): Accessory[] => {
    return character.accessories.filter(acc => acc.isEquipped);
  };

  return (
    <CharacterContext.Provider value={{
      character,
      setCharacter,
      updateCharacterName,
      addAccessory,
      toggleAccessory,
      setBackground,
      addCoins,
      addExperience,
      addPoints,
      getEquippedAccessories
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

// Custom hook to use the character context
export const useCharacter = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
