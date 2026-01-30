'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { useAuth } from '@/contexts/AuthContext';
import { storyGameAPI } from '@/lib/api';
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
}

const SCENES = {
  forest: {
    name: 'Mystical Forest',
    background: 'linear-gradient(135deg, #2d5016 0%, #1a3009 100%)',
    locations: ['forest_entrance', 'forest_path', 'forest_clearing', 'forest_exit'],
  },
  castle: {
    name: 'Ancient Castle',
    background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%)',
    locations: ['castle_gate', 'castle_courtyard', 'castle_hall', 'castle_tower'],
  },
  town: {
    name: 'Medieval Town',
    background: 'linear-gradient(135deg, #8b6f47 0%, #5a4a3a 100%)',
    locations: ['town_gate', 'town_square', 'town_market', 'town_exit'],
  },
  ocean: {
    name: 'Mystical Ocean',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0a1f3d 50%, #006994 100%)',
    locations: ['beach_shore', 'tide_pool', 'cave_entrance', 'treasure_cove'],
  },
  mountain: {
    name: 'Mountain Peak',
    background: 'linear-gradient(135deg, #8b7355 0%, #5a4a3a 50%, #3d2f1f 100%)',
    locations: ['mountain_base', 'cliff_path', 'summit', 'cave'],
  },
  desert: {
    name: 'Ancient Desert',
    background: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 50%, #8b6914 100%)',
    locations: ['oasis', 'sand_dunes', 'ancient_ruins', 'temple'],
  },
};

export default function StoryGamePage() {
  const { character, addCoins, addExperience } = useCharacter();
  
  // Apply custom background if equipped
  const backgroundStyle = character.background ? {
    background: character.background.value,
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  } : {};
  const { authState } = useAuth();
  
  // Get scene-specific default code
  const getDefaultCode = (scene: string) => {
    switch (scene) {
      case 'forest':
        return `# Write Python code to make decisions!
# Example:
# if "key" in inventory:
#     open_door()
# else:
#     print("You need a key!")
`;
      case 'castle':
        return `# Use if/else to check your inventory!
# Example:
# if "sword" in inventory:
#     move_to("castle_hall")
# else:
#     collect_item("sword")
`;
      case 'town':
        return `# Check your location with if statements!
# Example:
# if current_location == "town_market":
#     collect_item("bread")
# else:
#     move_to("town_market")
`;
      case 'ocean':
        return `# Use if/else to check items before accessing treasure!
# Example:
# if "treasure_map" in inventory:
#     move_to("treasure_cove")
# else:
#     collect_item("treasure_map")
`;
      case 'mountain':
        return `# Safety first! Check equipment with if/else!
# Example:
# if "rope" in inventory:
#     move_to("cliff_path")
# else:
#     collect_item("rope")
`;
      case 'desert':
        return `# Manage your resources with if/else!
# Example:
# if "water" in inventory:
#     move_to("ancient_ruins")
# else:
#     collect_item("water")
`;
      default:
        return `# Write Python code to make decisions!
# Example:
# if "key" in inventory:
#     open_door()
# else:
#     print("You need a key!")
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
  const [collectedItem, setCollectedItem] = useState<string | null>(null);
  const [showCharacterCollectEffect, setShowCharacterCollectEffect] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true); // Start expanded by default

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
      console.log('Available items loaded:', items);
      setAvailableItems(items);
      // Set default code based on current scene
      if (response.data.currentScene) {
        setCode(getDefaultCode(response.data.currentScene));
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
      
      // Update default code when scene changes
      if (newScene !== prevScene) {
        setCode(getDefaultCode(newScene));
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
      <div style={{ maxWidth: '100%', margin: '0 auto', ...backgroundStyle }}>
        <Navigation />
        <div className="story-game-container" style={{ height: 'calc(100vh - 100px)' }}>
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
                          <p>Collect the sword and shield to progress through the castle. Use <strong>if/else statements</strong> to check your inventory!</p>
                          <p><strong>Step 1:</strong> Move to different locations to find items: <code>move_to("castle_courtyard")</code></p>
                          <p><strong>Step 2:</strong> Collect items when you find them: <code>collect_item("sword")</code></p>
                          <p><strong>Step 3:</strong> Use if statements to check before moving: <code>if "sword" in inventory: move_to("castle_hall")</code></p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'town' && (
                        <>
                          <p>Explore the town market to find useful items. Use <strong>if statements to check your location</strong>!</p>
                          <p><strong>Step 1:</strong> Move to the market: <code>move_to("town_market")</code></p>
                          <p><strong>Step 2:</strong> Check your location with if: <code>if current_location == "town_market": collect_item("bread")</code></p>
                          <p><strong>Step 3:</strong> Use if/else to handle different locations!</p>
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
                          <p>Safety first! Collect the rope and torch before climbing. Use <strong>if/else to check your equipment</strong>!</p>
                          <p><strong>Step 1:</strong> Collect the rope first: <code>move_to("cliff_path")</code> then <code>collect_item("rope")</code></p>
                          <p><strong>Step 2:</strong> Check before climbing: <code>if "rope" in inventory: move_to("summit")</code></p>
                          <p><strong>Step 3:</strong> Get the torch before the cave: <code>if "torch" in inventory: move_to("cave")</code></p>
                        </>
                      )}
                      {storyProgress?.currentScene === 'desert' && (
                        <>
                          <p>Survival in the desert! Collect water and manage your resources. Use <strong>if/else for resource management</strong>!</p>
                          <p><strong>Step 1:</strong> Get water first: <code>move_to("sand_dunes")</code> then <code>collect_item("water")</code></p>
                          <p><strong>Step 2:</strong> Check resources before exploring: <code>if "water" in inventory: move_to("ancient_ruins")</code></p>
                          <p><strong>Step 3:</strong> Collect artifact before temple: <code>if "artifact" in inventory: move_to("temple")</code></p>
                        </>
                      )}
                    </div>
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
                style={{ background: currentScene.background }}
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
