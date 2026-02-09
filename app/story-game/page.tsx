'use client';

import { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { storyGameAPI } from '@/lib/api';
import { SCENES, ENDINGS, getNarrative } from '@/lib/storyGameConstants';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/StoryGamePage.css';

// Image paths for Next.js public folder
const girlCharacter = '/images/characters/Girl_Character_BrownHair.png';
const boyCharacter = '/images/characters/Boy_Character_BrownHair.png';
const brownGirlCharacter = '/images/characters/Brown_Girl_Character_BlackHair.png';
const brownBoyCharacter = '/images/characters/Brown_Boy_Character_BlackHair.png';
const blondeGirlCharacter = '/images/characters/Girl_Character_BlondeHair.png';
const blondeBoyCharacter = '/images/characters/Boy_Character_BlondeHair_NEW.png'; // new blonde boy base
const girlHoodieCharacter = '/images/characters/Girl_Character_In_PinkHoodie.png';
const girlHoodieSneakersCharacter = '/images/characters/Girl_Character_In_PinkHoodie_WhiteSneakers.png';
const PetAxolotyl = '/images/items/Pet_Axolotyl.png';
const puppyPet = '/images/items/Pet_Puppy.png';
const dragonPet = '/images/items/Pet_Dragon.png';
const bettaFishPet = '/images/items/Pet_BettaFish.png';
const catPet = '/images/items/Pet_Cat.png';
const goldenRetrieverPet = '/images/items/Pet_GoldenRetriever.png';
const unicornPet = '/images/items/Pet_Unicorn.png';

interface StoryProgress {
  currentScene: string;
  currentLocation: string;
  inventory: string[];
  storyProgress: number;
  completedScenes: any[];
  hintsUsed: any[];
  storyFlags?: string[];
  ending?: string | null;
}

// Scene backgrounds for visual display
const SCENE_BACKGROUNDS: Record<string, string> = {
  forest: 'url(/images/backgrounds/Background_Forest.png)',
  castle: 'url(/images/backgrounds/Background_Castle.png)',
  town: 'url(/images/backgrounds/Background_Village_Square.png)',
  ocean: 'linear-gradient(135deg, #1e3a5f 0%, #0a1f3d 50%, #006994 100%)',
  mountain: 'url(/images/backgrounds/Background_Mountain.png)',
  cave: 'url(/images/backgrounds/Background_Cave.png)',
  dragonLair: 'url(/images/backgrounds/Background_Dragon_Lair.png)',
  castleHall: 'url(/images/backgrounds/Background_Castle_Hall.png)',
  castleCourtyard: 'url(/images/backgrounds/Background_Castle_Courtyard.png)',
  castleTower: 'url(/images/backgrounds/Background_Castle_Tower.png)',
  desert: 'url(/images/backgrounds/Background_Desert.png)',
};

export default function StoryGamePage() {
  const { character, addCoins, addExperience } = useCharacter();
  
  // Apply custom background if equipped
  const backgroundStyle = character.background ? {
    background: character.background.value,
    backgroundAttachment: 'fixed'
  } : {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  // Story-guided default code: location-specific hints, then scene fallback
  const DEFAULT_CODE_BY_LOCATION: Record<string, string> = {
    forest_entrance: `# Explore the forest to find the key.
# move_to("forest_path") or move_to("forest_clearing")
`,
    forest_path: `# Keep exploring. Try move_to("forest_clearing") or move_to("forest_exit")
`,
    forest_clearing: `# move_to("forest_exit") to reach the paths out, or rest here
`,
    forest_exit: `# Choose your path: choose_path("path_castle"), choose_path("path_town"), or stay
`,
    castle_gate: `# Enter the courtyard: move_to("castle_courtyard")
`,
    castle_courtyard: `# To leave: choose_path("leave_castle")
# To explore: move_to("castle_hall") or move_to("castle_tower")
`,
    castle_hall: `# move_to("castle_tower") or move_to("castle_courtyard")
`,
    castle_tower: `# Get the crown: collect_item("crown")
# Then choose_path("explore_ocean") or choose_path("continue_town")
`,
    dragon_lair: `# First: hypnotize_dragon()   Then: fight_dragon()
# Or choose_path("peaceful_ending") to make peace
`,
    town_gate: `# move_to("town_square") or move_to("town_market")
`,
    town_square: `# move_to("town_market") to find items, or move_to("town_exit") to leave
`,
    town_market: `# collect_item("shield"), collect_item("bread"), or choose_path("travel_to_castle") when ready
`,
    town_exit: `# choose_path("return_castle"), choose_path("path_forest"), or choose_path("ask_merchant_ocean") if you helped them
`,
    beach_shore: `# move_to("tide_pool"), move_to("cave_entrance"), or move_to("treasure_cove")
`,
    tide_pool: `# move_to("beach_shore"), move_to("cave_entrance"), or search here
`,
    cave_entrance: `# collect_item("pearl") if you see it; move_to("treasure_cove") or move_to("beach_shore")
`,
    treasure_cove: `# collect_item("treasure_map"); then choose_path("path_mountain") or choose_path("path_desert")
`,
    mountain_base: `# collect_item("sword"); move_to("cliff_path") or choose_path("travel_to_town")
`,
    cliff_path: `# collect_item("rope"); then move_to("summit") or move_to("mountain_base")
`,
    summit: `# collect_item("torch"); move_to("cave") or move_to("dark_cave") (need torch!)
`,
    cave: `# collect_item("crystal"); choose_path("path_desert") or move_to("summit")
`,
    oasis: `# move_to("sand_dunes"), move_to("ancient_ruins"), or move_to("temple")
`,
    sand_dunes: `# collect_item("water"); move_to("ancient_ruins") or move_to("oasis")
`,
    ancient_ruins: `# collect_item("artifact"); move_to("temple") or move_to("ancient_temple")
`,
    temple: `# collect_item("scroll") and collect_item("magic_gem"); then move_to("ancient_temple") if ready
`,
  };

  const getDefaultCode = (scene: string, location?: string): string => {
    if (location && DEFAULT_CODE_BY_LOCATION[location]) return DEFAULT_CODE_BY_LOCATION[location];
    switch (scene) {
      case 'forest':
        return `# Explore with move_to("location_name"). Find the key, then open_door()
`;
      case 'castle':
        return `# move_to("castle_hall"), move_to("castle_tower"), or choose_path("leave_castle")
`;
      case 'town':
        return `# move_to("town_market") to find items; use choose_path() at decision points
`;
      case 'ocean':
        return `# move_to("tide_pool"), move_to("cave_entrance"), or move_to("treasure_cove")
`;
      case 'mountain':
        return `# move_to("cliff_path"), move_to("summit"), or move_to("cave"). Get rope and torch first
`;
      case 'desert':
        return `# move_to("sand_dunes"), move_to("ancient_ruins"), or move_to("temple")
`;
      default:
        return `# Explore with move_to("location_name") or choose_path("choice_id") at decision points
`;
    }
  };

  const [code, setCode] = useState(getDefaultCode('forest'));
  const [storyProgress, setStoryProgress] = useState<StoryProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 });
  const [isWalking, setIsWalking] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [selectedHintLevel, setSelectedHintLevel] = useState(1);
  const [hintText, setHintText] = useState('');
  const [error, setError] = useState('');
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelCompleteData, setLevelCompleteData] = useState<any>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [sceneChanged, setSceneChanged] = useState(false);
  const [lastRewards, setLastRewards] = useState({ coins: 0, experience: 0 });
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [availableChoices, setAvailableChoices] = useState<Array<{id: string; description: string; requiredItem?: string; available: boolean}>>([]);
  const [collectedItem, setCollectedItem] = useState<string | null>(null);
  const [showCharacterCollectEffect, setShowCharacterCollectEffect] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true); // Start expanded by default
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [deathMessage, setDeathMessage] = useState('');
  const [deathCount, setDeathCount] = useState(0);
  const [endingModal, setEndingModal] = useState<{ title: string; message: string } | null>(null);

  // Get character image
  const getCharacterImage = () => {
    const pinkHoodieEquipped = character?.accessories?.some(
      acc => acc.name === 'Pink Hoodie' && acc.isEquipped
    ) || false;
    const whiteSneakersEquipped = character?.accessories?.some(
      acc => acc.name === 'White Sneakers' && acc.isEquipped
    ) || false;

    if (pinkHoodieEquipped && whiteSneakersEquipped && character.id === 'girl1') {
      return girlHoodieSneakersCharacter;
    }
    if (pinkHoodieEquipped && character.id === 'girl1') {
      return girlHoodieCharacter;
    }
    if (character.image) {
      return character.image;
    }
    if (character.id === 'boy1') return boyCharacter;
    if (character.id === 'brown-boy1') return brownBoyCharacter;
    if (character.id === 'brown-girl1') return brownGirlCharacter;
    if (character.id === 'blonde-girl1') return blondeGirlCharacter;
    if (character.id === 'blonde-boy1') return blondeBoyCharacter;
    return girlCharacter;
  };

  // Get equipped pet
  const getEquippedPet = () => {
    const equippedPet = character.accessories?.find(acc => acc.type === 'pet' && acc.isEquipped);
    if (equippedPet) {
      if (equippedPet.name === 'Axolotyl Pet') return PetAxolotyl;
      if (equippedPet.name === 'Puppy Pet') return puppyPet;
      if (equippedPet.name === 'Dragon Pet') return dragonPet;
      if (equippedPet.name === 'Betta Fish Pet') return bettaFishPet;
      if (equippedPet.name === 'Cat Pet') return catPet;
      if (equippedPet.name === 'Unicorn Pet') return unicornPet;
      if (equippedPet.name === 'Golden Retriever Pet') return goldenRetrieverPet;
      // Fallback to image from accessory if it's a valid path
      if (equippedPet.image && (equippedPet.image.includes('.png') || equippedPet.image.includes('.jpg') || equippedPet.image.startsWith('/'))) {
        return equippedPet.image;
      }
    }
    return null;
  };
  
  // Get equipped accessories (excluding pets)
  const equippedAccessories = character.accessories?.filter(
    acc => acc.type !== 'pet' && acc.isEquipped
  ) || [];

  // Load story progress
  useEffect(() => {
    loadStoryProgress();
  }, []);

  const loadStoryProgress = async () => {
    try {
      const response = await storyGameAPI.getProgress();
      setStoryProgress(response.data);
      // Set available items from backend
      const items = response.data.availableItems || [];
      const choices = response.data.availableChoices || [];
      console.log('Available items loaded:', items);
      console.log('Available choices loaded:', choices);
      setAvailableItems(items);
      setAvailableChoices(choices);
      if (response.data.ending && ENDINGS[response.data.ending]) {
        setEndingModal({
          title: ENDINGS[response.data.ending].title,
          message: ENDINGS[response.data.ending].message,
        });
      } else {
        setEndingModal(null);
      }
      // Set default code based on current scene and location (story-guided hints)
      if (response.data.currentScene) {
        setCode(getDefaultCode(response.data.currentScene, response.data.currentLocation));
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading story progress:', error);
      setError(error.response?.data?.message || 'Failed to load story progress');
      setLoading(false);
    }
  };

  // Execute Python code
  const executeCode = async () => {
    if (!code.trim()) {
      setError('Please write some Python code!');
      return;
    }

    setExecuting(true);
    setError('');
    setMessage('');
    setLastRewards({ coins: 0, experience: 0 });

    try {
      // Animate character walking
      setIsWalking(true);
      setCharacterPosition(prev => ({ x: prev.x + 20, y: prev.y }));

      const response = await storyGameAPI.executeCode(code);

      // Check for death first
      if (response.data.action === 'death') {
        setDeathMessage(response.data.deathMessage || '💀 You have died!');
        setDeathCount(response.data.deathCount || 0);
        setShowDeathModal(true);
        // Update progress to show reset location
        if (response.data.newLocation) {
          setStoryProgress(prev => prev ? {
            ...prev,
            currentLocation: response.data.newLocation,
          } : null);
        }
        // Reload progress after a short delay
        setTimeout(() => {
          loadStoryProgress();
        }, 100);
        setExecuting(false);
        setIsWalking(false);
        return;
      }

      // Any ending reached (dragon defeated, peaceful, treasure escape): show ending modal
      if (response.data.endingId) {
        const newLocation = response.data.newLocation || storyProgress?.currentLocation;
        const newScene = response.data.newScene || storyProgress?.currentScene;
        setStoryProgress(prev => ({
          ...prev!,
          currentLocation: newLocation,
          currentScene: newScene,
          inventory: response.data.newInventory ?? prev?.inventory,
          storyProgress: response.data.storyProgress ?? prev?.storyProgress ?? 0,
          ending: response.data.endingId,
        }));
        if (response.data.coinsEarned) addCoins(response.data.coinsEarned);
        if (response.data.experienceEarned) addExperience(response.data.experienceEarned);
        setEndingModal({
          title: response.data.endingTitle || ENDINGS[response.data.endingId]?.title || 'The End',
          message: response.data.endingMessage || ENDINGS[response.data.endingId]?.message || response.data.message,
        });
        if (response.data.dragonDefeated) {
          setLevelCompleteData({
            message: response.data.message,
            coinsEarned: response.data.coinsEarned ?? 0,
            experienceEarned: response.data.experienceEarned ?? 0,
          });
          setShowLevelComplete(true);
          setTimeout(() => setShowLevelComplete(false), 4000);
        }
        setMessage(response.data.message || '');
        setExecuting(false);
        setIsWalking(false);
        return;
      }

      // Legacy: dragon defeated without endingId (backward compat)
      if (response.data.dragonDefeated === true) {
        const newLocation = response.data.newLocation || storyProgress?.currentLocation;
        const newScene = response.data.newScene || storyProgress?.currentScene;
        setStoryProgress(prev => ({
          ...prev!,
          currentLocation: newLocation,
          currentScene: newScene,
          inventory: response.data.newInventory ?? prev?.inventory,
          storyProgress: response.data.storyProgress ?? prev?.storyProgress ?? 0,
        }));
        if (response.data.coinsEarned) addCoins(response.data.coinsEarned);
        if (response.data.experienceEarned) addExperience(response.data.experienceEarned);
        setLevelCompleteData({
          message: response.data.message,
          coinsEarned: response.data.coinsEarned ?? 0,
          experienceEarned: response.data.experienceEarned ?? 0,
        });
        setShowLevelComplete(true);
        setMessage(response.data.message || 'You defeat the dragon!');
        setTimeout(() => setShowLevelComplete(false), 4000);
        setExecuting(false);
        setIsWalking(false);
        return;
      }

      // Update character context
      if (response.data.coinsEarned) {
        addCoins(response.data.coinsEarned);
      }
      if (response.data.experienceEarned) {
        addExperience(response.data.experienceEarned);
      }

      // Check if scene changed
      const sceneChanged = response.data.newLocation !== storyProgress?.currentLocation && 
                          (response.data.message?.includes('completed') || response.data.message?.includes('enter'));
      
      // Check if door was opened (successful open_door action)
      const doorOpened = response.data.action === 'open_door' && response.data.success && 
                        response.data.message?.includes('Door opened');
      
      // Update story progress first
      const prevScene = storyProgress?.currentScene;
      const newScene = response.data.newScene || storyProgress?.currentScene || 'forest';
      const newLocation = response.data.newLocation || storyProgress?.currentLocation || 'forest_entrance';
      
      console.log('Updating story progress:', {
        prevScene,
        newScene,
        prevLocation: storyProgress?.currentLocation,
        newLocation,
        responseData: response.data
      });
      
      setStoryProgress(prev => ({
        ...prev!,
        currentLocation: newLocation,
        currentScene: newScene,
        inventory: response.data.newInventory,
        storyProgress: response.data.storyProgress || prev?.storyProgress || 0,
      }));
      
      // Update default code when scene or location changes (story-guided hints)
      if (newScene !== prevScene || newLocation !== storyProgress?.currentLocation) {
        setCode(getDefaultCode(newScene, newLocation));
      }

      // Update available items from response
      const newAvailableItems = response.data.availableItems || [];
      console.log('Available items after move:', {
        newAvailableItems,
        location: response.data.newLocation,
        scene: response.data.newScene,
        inventory: response.data.newInventory,
        fullResponse: response.data,
        responseKeys: Object.keys(response.data)
      });
      setAvailableItems(newAvailableItems);
      setAvailableChoices(response.data.availableChoices || []);
      
      // If it was a move action, reload progress to ensure sync
      if (response.data.action === 'move' && response.data.success) {
        // Small delay to ensure backend has saved
        setTimeout(async () => {
          try {
            const progressResponse = await storyGameAPI.getProgress();
            const items = progressResponse.data.availableItems || [];
            console.log('Reloaded available items:', items, 'at location:', progressResponse.data.currentLocation);
            setAvailableItems(items);
            setStoryProgress(progressResponse.data);
          } catch (err) {
            console.error('Error reloading progress:', err);
          }
        }, 100);
      }

      // Show collection animation
      if (response.data.action === 'collect' && response.data.success) {
        const itemName = response.data.message.match(/collected a (\w+)/)?.[1];
        if (itemName) {
          setCollectedItem(itemName);
          setTimeout(() => setCollectedItem(null), 2000);
        }
        // Trigger a short sparkle effect near the character
        setShowCharacterCollectEffect(true);
        setTimeout(() => setShowCharacterCollectEffect(false), 800);
      }

      // Show detailed feedback
      let feedbackMessage = response.data.message || 'Code executed successfully!';
      
      // Store rewards separately for display
      const coinsEarned = response.data.coinsEarned || 0;
      const experienceEarned = response.data.experienceEarned || 0;
      
      if (coinsEarned > 0 || experienceEarned > 0) {
        setLastRewards({ coins: coinsEarned, experience: experienceEarned });
      }

      setMessage(feedbackMessage);

      // Handle door opening
      if (doorOpened) {
        setDoorOpen(true);
        setTimeout(() => setDoorOpen(false), 2000);
        
        // Reload progress after door opens to ensure scene/location updates
        setTimeout(async () => {
          try {
            const progressResponse = await storyGameAPI.getProgress();
            console.log('Reloaded progress after door open:', {
              location: progressResponse.data.currentLocation,
              scene: progressResponse.data.currentScene,
              inventory: progressResponse.data.inventory
            });
            setAvailableItems(progressResponse.data.availableItems || []);
            setAvailableChoices(progressResponse.data.availableChoices || []);
            setStoryProgress(progressResponse.data);
          } catch (err) {
            console.error('Error reloading progress after door open:', err);
          }
        }, 300);
      }

      // Handle scene change
      if (sceneChanged || (response.data.newScene && response.data.newScene !== storyProgress?.currentScene)) {
        setSceneChanged(true);
        setShowLevelComplete(true);
        setLevelCompleteData({
          scene: response.data.newScene || storyProgress?.currentScene,
          message: response.data.message,
          coinsEarned: response.data.coinsEarned,
          experienceEarned: response.data.experienceEarned,
        });
        
        // Reload progress to ensure scene is updated
        setTimeout(async () => {
          try {
            const progressResponse = await storyGameAPI.getProgress();
            console.log('Reloaded progress after scene change:', {
              location: progressResponse.data.currentLocation,
              scene: progressResponse.data.currentScene,
              inventory: progressResponse.data.inventory
            });
            setAvailableItems(progressResponse.data.availableItems || []);
            setAvailableChoices(progressResponse.data.availableChoices || []);
            setStoryProgress(progressResponse.data);
          } catch (err) {
            console.error('Error reloading progress after scene change:', err);
          }
        }, 300);
        
        setTimeout(() => {
          setSceneChanged(false);
          setShowLevelComplete(false);
        }, 4000);
      }

      // Animate character to new position
      setTimeout(() => {
        setIsWalking(false);
        if (response.data.newLocation !== storyProgress?.currentLocation) {
          // Character moved to new location
          setCharacterPosition({ x: 50, y: 50 });
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error executing code:', error);
      setError(error.response?.data?.message || 'Code execution failed. Please check your syntax.');
      setIsWalking(false);
    } finally {
      setExecuting(false);
    }
  };

  // Purchase hint
  const purchaseHint = async (hintLevel: number) => {
    if (character.coins < (hintLevel * 10)) {
      setError(`Not enough coins! You need ${hintLevel * 10} coins for this hint.`);
      return;
    }

    try {
      const response = await storyGameAPI.purchaseHint(hintLevel);
      setHintText(response.data.hint);
      setSelectedHintLevel(hintLevel);
      setShowHintModal(true);
      
      // Update character coins
      addCoins(-response.data.cost);
    } catch (error: any) {
      console.error('Error purchasing hint:', error);
      setError(error.response?.data?.message || 'Failed to purchase hint');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          <Navigation />
          <div className="story-game-loading">
            <p>Loading your adventure...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentScene = storyProgress ? SCENES[storyProgress.currentScene as keyof typeof SCENES] : SCENES.forest;
  const petImage = getEquippedPet();

  return (
    <ProtectedRoute>
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, ...backgroundStyle }}>
        <Navigation />
        <div className="story-game-container" style={{ height: '100vh', background: 'transparent' }}>
          {/* Header */}
          <div className="story-game-header">
            <h1>Python Story Adventure</h1>
            <div className="story-game-stats">
              <div className="stat-item">
                <span className="stat-label">Scene:</span>
                <span className="stat-value">{currentScene.name}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Location:</span>
                <span className="stat-value">{storyProgress?.currentLocation.replace(/_/g, ' ')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Coins:</span>
                <span className="stat-value">🪙 {character.coins || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progress:</span>
                <span className="stat-value">{storyProgress?.storyProgress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Main Content - Split Screen */}
          <div className="story-game-main">
            {/* Left Side - Code Editor */}
            <div className="story-game-code-panel">
              <div className="code-panel-header">
                <h2>Python Code Editor</h2>
                <div className="hint-buttons">
                  <button
                    className="hint-btn hint-1"
                    onClick={() => purchaseHint(1)}
                    disabled={character.coins < 10 || executing}
                  >
                    💡 Hint 1 (10 coins)
                  </button>
                  <button
                    className="hint-btn hint-2"
                    onClick={() => purchaseHint(2)}
                    disabled={character.coins < 20 || executing}
                  >
                    💡 Hint 2 (20 coins)
                  </button>
                  <button
                    className="hint-btn hint-3"
                    onClick={() => purchaseHint(3)}
                    disabled={character.coins < 30 || executing}
                  >
                    💡 Hint 3 (30 coins)
                  </button>
                </div>
              </div>

              {/* Story narrative - book-like description for current location */}
              {storyProgress?.currentLocation && (
                <div className="story-narrative">
                  <p>{getNarrative(storyProgress.currentLocation, storyProgress.storyFlags)}</p>
                </div>
              )}
              
              {/* How to Play Instructions - Collapsible */}
              <div className="how-to-play-panel" style={{ display: 'block' }}>
                <div 
                  className="how-to-play-header"
                  onClick={() => setShowHowToPlay(!showHowToPlay)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <h3>🎮 How to Play</h3>
                  <span className="dropdown-arrow">{showHowToPlay ? '▲' : '▼'}</span>
                </div>
                {showHowToPlay && (
                  <div className="how-to-play-content" style={{ display: 'block' }}>
                    <ol>
                      <li>Write Python code in the editor below</li>
                      <li><strong>Move to different locations</strong> to find items! Use <code>move_to("some_location")</code> to explore</li>
                      <li>When you see a glowing item in the scene, use <code>collect_item("item_name")</code> to collect it</li>
                      <li>Use <code>if "key" in inventory: open_door()</code> to make decisions</li>
                      <li>Click the <strong>"▶ Run Code"</strong> button to execute</li>
                      <li>Watch your character move and collect items!</li>
                    </ol>
                    <div className="quest-hint">
                      <strong>🎯 Your Quest:</strong>
                      {storyProgress?.currentScene === 'forest' && (
                        <>
                          <p>There is a hidden key somewhere in the forest. You need to <strong>move through different locations</strong> until you discover it.</p>
                          <p><strong>Step 1:</strong> Use <code>move_to("location_name")</code> to travel around the map.</p>
                          <p><strong>Step 2:</strong> When you see a glowing key, run <code>collect_item("key")</code> to pick it up.</p>
                          <p><strong>Step 3:</strong> Then use <code>if "key" in inventory: open_door()</code> to open the door!</p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'castle' && (
                        <>
                          <p>To beat the dragon you need <strong>sword</strong> (mountain base), <strong>shield</strong> (town market), <strong>crown</strong> (castle tower), and <strong>magic gem</strong> (desert temple).</p>
                          <p><strong>Step 1:</strong> Get the crown here: <code>move_to(&quot;castle_tower&quot;)</code> then <code>collect_item(&quot;crown&quot;)</code>. Get the magic gem from the desert temple first if you don&apos;t have it.</p>
                          <p><strong>Step 2:</strong> At the lair: <code>move_to(&quot;dragon_lair&quot;)</code>. Then use <code>hypnotize_dragon()</code> (uses the magic gem), then <code>fight_dragon()</code> (needs sword, shield, crown, and dragon hypnotized).</p>
                          <p><strong>Step 3:</strong> Don&apos;t enter the dragon lair without sword and shield—you won&apos;t survive!</p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'town' && (
                        <>
                          <p>Explore the town market. Get the <strong>shield</strong> here—you&apos;ll need it <strong>with the sword</strong> (from the mountain base) to face the dragon in the castle!</p>
                          <p><strong>Step 1:</strong> Move to the market: <code>move_to(&quot;town_market&quot;)</code></p>
                          <p><strong>Step 2:</strong> Collect the shield: <code>collect_item(&quot;shield&quot;)</code></p>
                          <p><strong>Step 3:</strong> If you already have the sword, go to the castle. If not, head to the mountain base to get the sword first!</p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'ocean' && (
                        <>
                          <p>Find the treasure map to access the treasure cove! Use <strong>if/else to check items before accessing treasure</strong>.</p>
                          <p><strong>Step 1:</strong> Explore the ocean locations: <code>move_to("tide_pool")</code> or <code>move_to("cave_entrance")</code></p>
                          <p><strong>Step 2:</strong> Collect the treasure map: <code>collect_item("treasure_map")</code></p>
                          <p><strong>Step 3:</strong> Use if to check before entering: <code>if "treasure_map" in inventory: move_to("treasure_cove")</code></p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'mountain' && (
                        <>
                          <p>Safety first! Collect the rope and torch before climbing. Also get the <strong>sword</strong> here at the mountain base—you&apos;ll need it <strong>with the shield</strong> (from the town market) to face the dragon in the castle!</p>
                          <p><strong>Step 1:</strong> Get the sword here: <code>collect_item(&quot;sword&quot;)</code> (you&apos;re at mountain base).</p>
                          <p><strong>Step 2:</strong> For climbing: <code>move_to(&quot;cliff_path&quot;)</code> then <code>collect_item(&quot;rope&quot;)</code>; then <code>if &quot;rope&quot; in inventory: move_to(&quot;summit&quot;)</code> for the torch.</p>
                          <p><strong>Step 3:</strong> Before the dragon: get the shield at the town market if you don&apos;t have it yet!</p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'desert' && (
                        <>
                          <p>Survival in the desert! Collect water and the <strong>magic gem</strong> at the temple (with the scroll)—you need it to hypnotize the dragon!</p>
                          <p><strong>Step 1:</strong> Get water first: <code>move_to("sand_dunes")</code> then <code>collect_item("water")</code></p>
                          <p><strong>Step 2:</strong> Check resources before exploring: <code>if "water" in inventory: move_to("ancient_ruins")</code></p>
                          <p><strong>Step 3:</strong> At the temple: <code>if "artifact" in inventory: move_to("temple")</code> then <code>collect_item("scroll")</code> and <code>collect_item("magic_gem")</code></p>
                        </>
                      )}
                    </div>
                    {storyProgress?.inventory && (() => {
                      const inv = storyProgress.inventory;
                      const hasSword = inv.includes('sword');
                      const hasShield = inv.includes('shield');
                      if (hasSword && !hasShield) {
                        return (
                          <div className="quest-hint" style={{ marginTop: '12px', borderLeft: '4px solid #ff9800', background: 'rgba(255, 152, 0, 0.08)' }}>
                            <strong>➡️ Next step:</strong>
                            <p style={{ margin: '6px 0 0 0' }}>You have the sword! Get the <strong>shield</strong> at the town market next. From the mountain base, use <code>choose_path(&quot;travel_to_town&quot;)</code> to go to the town. Then <code>move_to(&quot;town_market&quot;)</code> and <code>collect_item(&quot;shield&quot;)</code>.</p>
                          </div>
                        );
                      }
                      if (hasShield && !hasSword) {
                        return (
                          <div className="quest-hint" style={{ marginTop: '12px', borderLeft: '4px solid #ff9800', background: 'rgba(255, 152, 0, 0.08)' }}>
                            <strong>➡️ Next step:</strong>
                            <p style={{ margin: '6px 0 0 0' }}>You have the shield! Get the <strong>sword</strong> at the mountain base next. Go to the mountain (from forest exit with a map, or from ocean), then <code>move_to(&quot;mountain_base&quot;)</code> and <code>collect_item(&quot;sword&quot;)</code>.</p>
                          </div>
                        );
                      }
                      const hasCrown = inv.includes('crown');
                      const hasMagicGem = inv.includes('magic_gem');
                      if (hasSword && hasShield && hasCrown && hasMagicGem) {
                        return (
                          <div className="quest-hint" style={{ marginTop: '12px', borderLeft: '4px solid #4caf50', background: 'rgba(76, 175, 80, 0.08)' }}>
                            <strong>➡️ Ready for the dragon!</strong>
                            <p style={{ margin: '6px 0 0 0' }}>You have sword, shield, crown, and magic gem. Go to the castle, then <code>move_to(&quot;dragon_lair&quot;)</code>. At the lair run <code>hypnotize_dragon()</code> first, then <code>fight_dragon()</code>!</p>
                          </div>
                        );
                      }
                      if (hasSword && hasShield) {
                        return (
                          <div className="quest-hint" style={{ marginTop: '12px', borderLeft: '4px solid #ff9800', background: 'rgba(255, 152, 0, 0.08)' }}>
                            <strong>➡️ Almost ready for the dragon!</strong>
                            <p style={{ margin: '6px 0 0 0' }}>Get the <strong>crown</strong> at the castle tower (<code>move_to(&quot;castle_tower&quot;)</code>, <code>collect_item(&quot;crown&quot;)</code>) and the <strong>magic gem</strong> at the desert temple. Then go to <code>dragon_lair</code> and use <code>hypnotize_dragon()</code> then <code>fight_dragon()</code>.</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {availableChoices.length > 0 && (
                      <div className="decision-point-hint" style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '15px',
                        borderRadius: '10px',
                        marginTop: '15px',
                        marginBottom: '15px',
                        color: 'white',
                        border: '2px solid #fff',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}>
                        <strong>🔀 Decision Point!</strong>
                        <p style={{ marginTop: '10px', marginBottom: '10px' }}>You&apos;re at a choice. Use <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>choose_path("choice_id")</code> with one of the IDs below. Some choices take you to another scene (e.g. town, ocean, desert).</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {availableChoices.map((choice) => (
                            <div key={choice.id} style={{
                              background: choice.available ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                              padding: '10px',
                              borderRadius: '6px',
                              border: `2px solid ${choice.available ? '#fff' : '#999'}`,
                              opacity: choice.available ? 1 : 0.6
                            }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {choice.available ? '✅' : '🔒'} {choice.description}
                              </div>
                              {choice.requiredItem && (
                                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                  {choice.available ? (
                                    <span>✓ You have: {choice.requiredItem}</span>
                                  ) : (
                                    <span>⚠️ Requires: {choice.requiredItem}</span>
                                  )}
                                </div>
                              )}
                              <code style={{ 
                                display: 'block', 
                                marginTop: '6px', 
                                fontSize: '0.8rem',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                color: 'white'
                              }}>
                                choose_path("{choice.id}")
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {storyProgress?.currentScene && (
                      <div className="location-guide" style={{
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        padding: '15px',
                        borderRadius: '10px',
                        marginTop: '15px',
                        border: '2px solid #90caf9'
                      }}>
                        <strong>🗺️ Where Can I Go?</strong>
                        {availableChoices.length > 0 && (
                          <>
                            <p style={{ marginTop: '8px', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                              You&apos;re at a decision point. Use the choices above with <code>choose_path("choice_id")</code> to move or change scenes. Or use <code>move_to("location_name")</code> for locations in this scene (below).
                            </p>
                            <p style={{ marginTop: '6px', marginBottom: '6px', fontSize: '0.85rem', color: '#1565c0', fontWeight: 500 }}>
                              💡 You can also type just the choice id and Run Code (e.g. <code>leave_castle</code> to leave the castle).
                            </p>
                          </>
                        )}
                        {availableChoices.length === 0 && (
                          <>
                            <p style={{ marginTop: '8px', marginBottom: '6px', fontSize: '0.9rem' }}>
                              <strong>In this scene</strong> (below): use <code>move_to("location_name")</code> to visit these locations.
                            </p>
                            <p style={{ marginTop: '4px', marginBottom: '10px', fontSize: '0.85rem', color: '#555' }}>
                              To go to a <strong>different scene</strong> (e.g. desert, ocean, town), go to a decision point and use <code>choose_path("choice_id")</code> when that choice appears.
                            </p>
                          </>
                        )}
                        {availableChoices.length > 0 && (
                          <p style={{ marginTop: '4px', marginBottom: '10px', fontSize: '0.85rem', color: '#555' }}>
                            <strong>In this scene</strong> (below): use <code>move_to("location_name")</code> to visit these locations.
                          </p>
                        )}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '8px',
                          marginTop: '10px'
                        }}>
                          {(() => {
                            const scene = SCENES[storyProgress.currentScene as keyof typeof SCENES];
                            if (!scene) return null;
                            return scene.locations.map((loc) => {
                              const isCurrent = loc === storyProgress?.currentLocation;
                              const locationName = loc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                              return (
                                <div 
                                  key={loc}
                                  style={{
                                    background: isCurrent ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                                    color: isCurrent ? 'white' : '#333',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: isCurrent ? 'bold' : 'normal',
                                    border: `2px solid ${isCurrent ? '#fff' : '#90caf9'}`,
                                    textAlign: 'center'
                                  }}
                                >
                                  {isCurrent ? '📍 ' : '🔹 '}
                                  {locationName}
                                  {isCurrent && ' (You are here)'}
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <p style={{ 
                          marginTop: '12px', 
                          fontSize: '0.85rem', 
                          fontStyle: 'italic',
                          color: '#555'
                        }}>
                          💡 Tip: <code>move_to()</code> only works for locations in your current scene. Use <code>choose_path()</code> at decision points to change scenes (e.g. to the desert or ocean).
                        </p>
                        {storyProgress?.currentLocation === 'dragon_lair' && (
                          <p style={{ marginTop: '10px', fontSize: '0.9rem', fontWeight: 600, color: '#c62828' }}>
                            🐉 At the dragon lair: use <code>hypnotize_dragon()</code> first, then <code>fight_dragon()</code> when you have sword, shield, crown, and the dragon is hypnotized.
                          </p>
                        )}
                      </div>
                    )}
                    {availableItems.length > 0 && (
                      <div className="available-items-hint">
                        <strong>💡 Tip:</strong> Look for glowing items in the scene! Use <code>collect_item("{availableItems[0]}")</code> to collect them.
                        <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                          Available at this location: {availableItems.join(', ')}
                        </div>
                      </div>
                    )}
                    {availableItems.length === 0 && storyProgress && !storyProgress.inventory.includes('key') && storyProgress.currentLocation === 'forest_entrance' && (
                      <div className="exploration-hint">
                        <strong>🔍 Where is the Key?</strong>
                        <p>You're at the forest entrance, but the key isn't here! You need to <strong>explore other locations</strong> to find it.</p>
                        <div className="location-guide">
                          <p><strong>📍 Available Locations:</strong></p>
                          <ul>
                            <li><code>forest_path</code></li>
                            <li><code>forest_clearing</code></li>
                            <li><code>forest_exit</code></li>
                          </ul>
                        </div>
                        <p className="hint-emphasis">💡 <strong>Try this:</strong> Experiment with different calls to <code>move_to("some_location")</code> until you spot something glowing.</p>
                      </div>
                    )}
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div style={{ marginTop: '10px', padding: '8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <strong>Debug:</strong> Location: {storyProgress?.currentLocation}, Available: [{availableItems.join(', ')}], Inventory: [{storyProgress?.inventory?.join(', ') || 'none'}]
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="code-editor-wrapper">
                <textarea
                  className="python-code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow Ctrl+Enter or Cmd+Enter to run code
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      if (!executing && code.trim()) {
                        executeCode();
                      }
                    }
                  }}
                  placeholder="Write Python if/else statements to make story decisions..."
                  spellCheck={false}
                />
              </div>

              {/* Prominent Run Button */}
              <div className="run-button-container">
                <button
                  className="execute-btn-large"
                  onClick={executeCode}
                  disabled={executing || !code.trim()}
                >
                  {executing ? (
                    <>
                      <span className="spinner">⏳</span> Executing Code...
                    </>
                  ) : (
                    <>
                      <span className="play-icon">▶</span> Run Code
                      <span className="keyboard-hint">(Ctrl+Enter)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="code-panel-footer">
                <div className="code-examples">
                  <p><strong>💡 Code Examples:</strong></p>
                  <div className="example-item">
                    <code>if "key" in inventory:</code>
                    <code className="indented">    open_door()</code>
                  </div>
                  <div className="example-item">
                    <code>collect_item("key")</code>
                  </div>
                  <div className="example-item">
                    <code>move_to("forest_path")</code>
                  </div>
                </div>
              </div>

              {/* Feedback Messages */}
              {error && (
                <div className="feedback-message error-message">
                  <div className="feedback-icon">❌</div>
                  <div className="feedback-content">
                    <strong>Error:</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {message && !error && (
                <div className="feedback-message success-message">
                  <div className="feedback-icon">✅</div>
                  <div className="feedback-content">
                    <strong>Result:</strong>
                    <pre>{message}</pre>
                  </div>
                </div>
              )}

              {/* Rewards Display - Show when rewards are earned */}
              {message && !error && executing === false && (lastRewards.coins > 0 || lastRewards.experience > 0) && (
                <div className="rewards-display">
                  {lastRewards.coins > 0 && (
                    <div className="reward-item">
                      <span className="reward-icon">🪙</span>
                      <span className="reward-text">+{lastRewards.coins} Coins</span>
                    </div>
                  )}
                  {lastRewards.experience > 0 && (
                    <div className="reward-item">
                      <span className="reward-icon">⭐</span>
                      <span className="reward-text">+{lastRewards.experience} XP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Display */}
              <div className="inventory-panel">
                <h3>📦 Inventory</h3>
                <div className="inventory-items">
                  {storyProgress?.inventory && storyProgress.inventory.length > 0 ? (
                    storyProgress.inventory.map((item, index) => (
                      <div key={index} className="inventory-item">
                        {item === 'key' && '🗝️'}
                        {item === 'sword' && '⚔️'}
                        {item === 'shield' && '🛡️'}
                        {item === 'crown' && '👑'}
                        {item === 'map' && '🗺️'}
                        {item === 'compass' && '🧭'}
                        {item === 'coin' && '🪙'}
                        {item === 'bread' && '🍞'}
                        {item === 'potion' && '🧪'}
                        {item === 'shell' && '🐚'}
                        {item === 'pearl' && '💎'}
                        {item === 'treasure_map' && '🗺️'}
                        {item === 'rope' && '🪢'}
                        {item === 'torch' && '🔥'}
                        {item === 'crystal' && '💠'}
                        {item === 'water' && '💧'}
                        {item === 'artifact' && '🏺'}
                        {item === 'scroll' && '📜'}
                        {item === 'magic_gem' && '💎'}
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-inventory">No items yet. Collect items using collect_item("item_name")</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Scene Viewer */}
            <div className="story-game-scene-panel">
              <div
                className="scene-background"
                data-location={storyProgress?.currentLocation || ''}
                style={{ 
                  background: (() => {
                    const scene = storyProgress?.currentScene || 'forest';
                    const location = storyProgress?.currentLocation || '';
                    // Use cave background when in cave or dark_cave (mountain scene)
                    if (scene === 'mountain' && (location === 'cave' || location === 'dark_cave')) {
                      return SCENE_BACKGROUNDS.cave || SCENE_BACKGROUNDS.mountain;
                    }
                    // Use dragon lair background when at dragon_lair (castle scene)
                    if (scene === 'castle' && location === 'dragon_lair') {
                      return SCENE_BACKGROUNDS.dragonLair || SCENE_BACKGROUNDS.castle;
                    }
                    // Use castle hall background when at castle_hall (castle scene)
                    if (scene === 'castle' && location === 'castle_hall') {
                      return SCENE_BACKGROUNDS.castleHall || SCENE_BACKGROUNDS.castle;
                    }
                    // Use castle courtyard background when at castle_courtyard (castle scene)
                    if (scene === 'castle' && location === 'castle_courtyard') {
                      return SCENE_BACKGROUNDS.castleCourtyard || SCENE_BACKGROUNDS.castle;
                    }
                    // Use castle tower background when at castle_tower (castle scene)
                    if (scene === 'castle' && location === 'castle_tower') {
                      return SCENE_BACKGROUNDS.castleTower || SCENE_BACKGROUNDS.castle;
                    }
                    return SCENE_BACKGROUNDS[scene] || SCENE_BACKGROUNDS.forest;
                  })(),
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Character */}
                <div
                  className={`character-sprite ${isWalking ? 'walking' : ''}`}
                  style={{
                    left: `${characterPosition.x}%`,
                    top: `${characterPosition.y}%`,
                  }}
                >
                  <img
                    src={getCharacterImage()}
                    alt="Character"
                    className="character-image"
                  />
                  {petImage && (
                    <img
                      src={petImage}
                      alt="Pet"
                      className="pet-sprite"
                    />
                  )}
                  {/* Sparkle effect when collecting items */}
                  {showCharacterCollectEffect && (
                    <div className="character-collect-effect">
                      ✨
                    </div>
                  )}
                  {/* Display equipped accessories */}
                  {equippedAccessories.map((accessory, idx) => (
                    <img
                      key={accessory.id || idx}
                      src={accessory.image}
                      alt={accessory.name}
                      className="accessory-sprite"
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: `${10 + idx * 20}px`,
                        width: '30px',
                        height: '30px',
                        objectFit: 'contain',
                        zIndex: 10
                      }}
                    />
                  ))}
                </div>

                {/* Scene Elements */}
                <div className="scene-elements">
                  {storyProgress?.currentScene === 'forest' && (
                    <>
                      <div className="scene-element tree tree-1">🌳</div>
                      <div className="scene-element tree tree-2">🌲</div>
                      <div className="scene-element tree tree-3">🌴</div>
                      <div className={`scene-element door ${doorOpen ? 'door-open' : ''}`}>
                        {doorOpen ? '🚪✨' : '🚪'}
                      </div>
                      {/* Collectible Items */}
                      {(() => {
                        const hasKey = storyProgress?.inventory?.includes('key') || false;
                        const keyAvailable = availableItems.includes('key');
                        const shouldShowKey = keyAvailable && !hasKey;
                        console.log('Key display check:', { keyAvailable, hasKey, shouldShowKey, availableItems, inventory: storyProgress?.inventory });
                        return shouldShowKey && (
                          <div className={`scene-element collectible-item item-key ${collectedItem === 'key' ? 'collected' : ''}`}>
                            🗝️
                            <div className="item-glow"></div>
                          </div>
                        );
                      })()}
                      {availableItems.includes('map') && !storyProgress?.inventory.includes('map') && (
                        <div className={`scene-element collectible-item item-map ${collectedItem === 'map' ? 'collected' : ''}`}>
                          🗺️
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('compass') && !storyProgress?.inventory.includes('compass') && (
                        <div className={`scene-element collectible-item item-compass ${collectedItem === 'compass' ? 'collected' : ''}`}>
                          🧭
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                  {storyProgress?.currentScene === 'castle' && (
                    <>
                      <div className="scene-element castle-wall">🏰</div>
                      <div className={`scene-element door ${doorOpen ? 'door-open' : ''}`}>
                        {doorOpen ? '🚪✨' : '🚪'}
                      </div>
                      <div className="scene-element flag">🏴</div>
                      {/* Collectible Items */}
                      {availableItems.includes('sword') && !storyProgress?.inventory.includes('sword') && (
                        <div className={`scene-element collectible-item item-sword ${collectedItem === 'sword' ? 'collected' : ''}`}>
                          ⚔️
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('shield') && !storyProgress?.inventory.includes('shield') && (
                        <div className={`scene-element collectible-item item-shield ${collectedItem === 'shield' ? 'collected' : ''}`}>
                          🛡️
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('crown') && !storyProgress?.inventory.includes('crown') && (
                        <div className={`scene-element collectible-item item-crown ${collectedItem === 'crown' ? 'collected' : ''}`}>
                          👑
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                  {storyProgress?.currentScene === 'town' && (
                    <>
                      <div className="scene-element building building-1">🏠</div>
                      <div className="scene-element building building-2">🏪</div>
                      <div className="scene-element market">🏛️</div>
                      {/* Collectible Items */}
                      {availableItems.includes('coin') && !storyProgress?.inventory.includes('coin') && (
                        <div className={`scene-element collectible-item item-coin ${collectedItem === 'coin' ? 'collected' : ''}`}>
                          🪙
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('bread') && !storyProgress?.inventory.includes('bread') && (
                        <div className={`scene-element collectible-item item-bread ${collectedItem === 'bread' ? 'collected' : ''}`}>
                          🍞
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('potion') && !storyProgress?.inventory.includes('potion') && (
                        <div className={`scene-element collectible-item item-potion ${collectedItem === 'potion' ? 'collected' : ''}`}>
                          🧪
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('shield') && !storyProgress?.inventory.includes('shield') && (
                        <div className={`scene-element collectible-item item-shield ${collectedItem === 'shield' ? 'collected' : ''}`}>
                          🛡️
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                  {storyProgress?.currentScene === 'ocean' && (
                    <>
                      <div className="scene-element wave wave-1">🌊</div>
                      <div className="scene-element wave wave-2">🌊</div>
                      <div className="scene-element beach">🏖️</div>
                      <div className="scene-element cave">🕳️</div>
                      {/* Collectible Items */}
                      {availableItems.includes('shell') && !storyProgress?.inventory.includes('shell') && (
                        <div className={`scene-element collectible-item item-shell ${collectedItem === 'shell' ? 'collected' : ''}`}>
                          🐚
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('pearl') && !storyProgress?.inventory.includes('pearl') && (
                        <div className={`scene-element collectible-item item-pearl ${collectedItem === 'pearl' ? 'collected' : ''}`}>
                          💎
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('treasure_map') && !storyProgress?.inventory.includes('treasure_map') && (
                        <div className={`scene-element collectible-item item-treasure-map ${collectedItem === 'treasure_map' ? 'collected' : ''}`}>
                          🗺️
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                  {storyProgress?.currentScene === 'mountain' && (
                    <>
                      <div className="scene-element mountain-peak">⛰️</div>
                      <div className="scene-element cliff">🧗</div>
                      <div className="scene-element cave">🕳️</div>
                      {/* Collectible Items */}
                      {availableItems.includes('rope') && !storyProgress?.inventory.includes('rope') && (
                        <div className={`scene-element collectible-item item-rope ${collectedItem === 'rope' ? 'collected' : ''}`}>
                          🪢
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('torch') && !storyProgress?.inventory.includes('torch') && (
                        <div className={`scene-element collectible-item item-torch ${collectedItem === 'torch' ? 'collected' : ''}`}>
                          🔥
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('crystal') && !storyProgress?.inventory.includes('crystal') && (
                        <div className={`scene-element collectible-item item-crystal ${collectedItem === 'crystal' ? 'collected' : ''}`}>
                          💠
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('sword') && !storyProgress?.inventory.includes('sword') && (
                        <div className={`scene-element collectible-item item-sword ${collectedItem === 'sword' ? 'collected' : ''}`}>
                          ⚔️
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                  {storyProgress?.currentScene === 'desert' && (
                    <>
                      <div className="scene-element sand-dune sand-dune-1">🏜️</div>
                      <div className="scene-element sand-dune sand-dune-2">🌵</div>
                      <div className="scene-element oasis">🌴</div>
                      <div className="scene-element temple">🏛️</div>
                      {/* Collectible Items */}
                      {availableItems.includes('water') && !storyProgress?.inventory.includes('water') && (
                        <div className={`scene-element collectible-item item-water ${collectedItem === 'water' ? 'collected' : ''}`}>
                          💧
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('artifact') && !storyProgress?.inventory.includes('artifact') && (
                        <div className={`scene-element collectible-item item-artifact ${collectedItem === 'artifact' ? 'collected' : ''}`}>
                          🏺
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('scroll') && !storyProgress?.inventory.includes('scroll') && (
                        <div className={`scene-element collectible-item item-scroll ${collectedItem === 'scroll' ? 'collected' : ''}`}>
                          📜
                          <div className="item-glow"></div>
                        </div>
                      )}
                      {availableItems.includes('magic_gem') && !storyProgress?.inventory.includes('magic_gem') && (
                        <div className={`scene-element collectible-item item-magic-gem ${collectedItem === 'magic_gem' ? 'collected' : ''}`}>
                          💎
                          <div className="item-glow"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Scene Info */}
              <div className="scene-info">
                <h3>{currentScene.name}</h3>
                <p>Location: {storyProgress?.currentLocation.replace(/_/g, ' ')}</p>
                <div className="scene-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${storyProgress?.storyProgress || 0}%` }}
                    />
                  </div>
                  <span>{storyProgress?.storyProgress || 0}% Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hint Modal */}
          {showHintModal && (
            <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
              <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                <h3>💡 Hint Level {selectedHintLevel}</h3>
                <p>{hintText}</p>
                <button onClick={() => setShowHintModal(false)}>Close</button>
              </div>
            </div>
          )}

          {/* Level Complete Modal */}
          {showLevelComplete && levelCompleteData && (
            <div className="level-complete-modal-overlay">
              <div className="level-complete-modal">
                <div className="celebration-icon">🎉</div>
                <h2>Level Complete!</h2>
                <p className="level-complete-message">{levelCompleteData.message}</p>
                <div className="level-rewards">
                  <div className="reward-badge">
                    <span className="reward-icon-large">🪙</span>
                    <span className="reward-amount">+{levelCompleteData.coinsEarned} Coins</span>
                  </div>
                  <div className="reward-badge">
                    <span className="reward-icon-large">⭐</span>
                    <span className="reward-amount">+{levelCompleteData.experienceEarned} XP</span>
                  </div>
                </div>
                <p className="next-scene-text">Moving to next scene...</p>
              </div>
            </div>
          )}

          {/* Death Modal */}
          {showDeathModal && (
            <div className="death-modal-overlay" onClick={() => {
              setShowDeathModal(false);
              loadStoryProgress();
            }}>
              <div className="death-modal" onClick={(e) => e.stopPropagation()}>
                <div className="death-icon">💀</div>
                <h2>You Have Died!</h2>
                <p className="death-message">{deathMessage}</p>
                {deathCount > 0 && (
                  <p className="death-count">Deaths: {deathCount}</p>
                )}
                <p className="death-hint">You've been reset to the start of this scene. Your inventory has been preserved.</p>
                <button 
                  className="try-again-button"
                  onClick={() => {
                    setShowDeathModal(false);
                    loadStoryProgress();
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Ending Modal */}
          {endingModal && (
            <div className="death-modal-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="death-modal ending-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ending-icon">🏆</div>
                <h2>{endingModal.title}</h2>
                <p className="death-message">{endingModal.message}</p>
                <button
                  className="try-again-button"
                  onClick={async () => {
                    setEndingModal(null);
                    await storyGameAPI.resetProgress();
                    loadStoryProgress();
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
