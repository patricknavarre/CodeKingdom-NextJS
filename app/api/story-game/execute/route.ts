import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import User from '@/models/userModel';
import { executePython, validatePythonCode } from '@/services/pythonExecutor';
import { SCENES, DECISION_POINTS, DANGEROUS_LOCATIONS, ENDINGS } from '@/lib/storyGameConstants';
import { isChoiceAvailable } from '@/lib/storyGameUtils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

// Helper function to reset player to scene start
function resetToSceneStart(storyGame: any): { location: string; isDead: boolean } {
  const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
  const firstLocation = scene.locations[0];
  return {
    location: firstLocation,
    isDead: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'Not authorized, no token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return Response.json({ message: 'Python code is required' }, { status: 400 });
    }
    
    // Validate code
    const validation = validatePythonCode(code);
    if (!validation.valid) {
      return Response.json({ message: validation.error }, { status: 400 });
    }
    
    // Get story game progress
    let storyGame = await StoryGame.findOne({ user: userId });
    if (!storyGame) {
      storyGame = await StoryGame.create({
        user: userId,
        currentScene: 'forest',
        currentLocation: 'forest_entrance',
        inventory: [],
      });
    }
    
    // Prepare context for Python execution
    const context = {
      inventory: storyGame.inventory.map(item => item.name),
      currentLocation: storyGame.currentLocation,
      currentScene: storyGame.currentScene,
    };
    
    // Execute Python code
    let result = await executePython(code, context);

    // If user typed just a choice id (e.g. "leave_castle"), treat as choose_path("leave_castle")
    if (result.action === 'continue' && result.success) {
      const trimmedCode = code.trim().replace(/\s+/g, ' ');
      const singleLine = trimmedCode.split('\n').filter((l: string) => l.trim()).length === 1;
      const bareId = trimmedCode.trim();
      const decisionPoint = DECISION_POINTS[storyGame.currentLocation];
      const choiceIds = decisionPoint?.choices?.map((c: { id: string }) => c.id) || [];
      if (singleLine && choiceIds.includes(bareId)) {
        result = { action: 'choose_path', choiceId: bareId, success: true };
      }
    }

    // Process result and update game state
    let updatedLocation = storyGame.currentLocation;
    let updatedInventory = [...storyGame.inventory];
    let coinsEarned = 0;
    let experienceEarned = 10; // Base experience for executing code
    let message = '';
    
    // Handle different actions
    if (result.action === 'open_door' && result.success) {
      // Check if player has key
      const hasKey = storyGame.inventory.some(item => item.name === 'key');
      if (hasKey) {
        // Move to next location
        const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
        const currentIndex = scene.locations.indexOf(storyGame.currentLocation);
        if (currentIndex < scene.locations.length - 1) {
          updatedLocation = scene.locations[currentIndex + 1];
          message = 'Door opened! You move forward.';
          coinsEarned = 20;
          experienceEarned = 25;
        } else {
          // Scene completed - opening door at last location advances to next scene
          const unlockedScenes = storyGame.unlockedScenes || [];
          const decisionPoint = DECISION_POINTS[storyGame.currentLocation];
          
          // If there's a decision point, try to auto-choose the first available choice
          if (decisionPoint && decisionPoint.choices.length > 0) {
            // Find the first available choice (one that doesn't require an item, or player has the item)
            const availableChoice = decisionPoint.choices.find(choice => {
              if (!choice.requiredItem) return true;
              return storyGame.inventory.some(item => item.name === choice.requiredItem);
            });
            
            if (availableChoice) {
              // Auto-choose the first available path
              if (availableChoice.nextScene) {
                storyGame.currentScene = availableChoice.nextScene as any;
                updatedLocation = availableChoice.nextLocation || (SCENES[availableChoice.nextScene as keyof typeof SCENES]?.locations[0] || storyGame.currentLocation);
                message = availableChoice.message || `You chose: ${availableChoice.description}`;
                coinsEarned = 30;
                experienceEarned = 30;
                
                // Unlock scene if specified
                if (availableChoice.unlocksScene && !storyGame.unlockedScenes.includes(availableChoice.unlocksScene)) {
                  storyGame.unlockedScenes.push(availableChoice.unlocksScene);
                }
              } else if (availableChoice.nextLocation) {
                updatedLocation = availableChoice.nextLocation;
                message = availableChoice.message || `You chose: ${availableChoice.description}`;
                coinsEarned = 15;
                experienceEarned = 15;
              } else {
                message = availableChoice.message || `You chose: ${availableChoice.description}`;
                coinsEarned = 10;
                experienceEarned = 10;
              }
            } else {
              // No available choice, fall through to default progression
              // Continue to default progression logic below
            }
          }
          
          // If no decision point or no available choice, use default progression
          if (!decisionPoint || !decisionPoint.choices.find(c => !c.requiredItem || storyGame.inventory.some(item => item.name === c.requiredItem))) {
            // Try to go to an unlocked scene first, otherwise default progression
            if (unlockedScenes.length > 0 && !unlockedScenes.includes(storyGame.currentScene)) {
              // Move to first unlocked scene not yet visited
              const nextUnlocked = unlockedScenes.find(s => s !== storyGame.currentScene);
              if (nextUnlocked) {
                storyGame.currentScene = nextUnlocked as any;
                const nextScene = SCENES[nextUnlocked as keyof typeof SCENES];
                updatedLocation = nextScene.locations[0];
                message = `You discovered a new path! You arrive at the ${nextScene.name}.`;
                coinsEarned = 50;
                experienceEarned = 50;
              }
            } else {
              // Default linear progression (fallback)
              if (storyGame.currentScene === 'forest') {
                // Forest can branch to castle or town
                storyGame.currentScene = 'castle';
                updatedLocation = 'castle_gate';
                message = 'Forest completed! You enter the castle.';
                coinsEarned = 50;
                experienceEarned = 50;
              } else if (storyGame.currentScene === 'castle') {
                // Castle can branch to town or ocean (if unlocked)
                if (unlockedScenes.includes('ocean')) {
                  storyGame.currentScene = 'ocean';
                  updatedLocation = 'beach_shore';
                  message = 'Castle completed! You arrive at the mystical ocean.';
                } else {
                  storyGame.currentScene = 'town';
                  updatedLocation = 'town_gate';
                  message = 'Castle completed! You enter the town.';
                }
                coinsEarned = 50;
                experienceEarned = 50;
              } else if (storyGame.currentScene === 'town') {
                // Town can branch to ocean (if unlocked) or continue linearly
                if (unlockedScenes.includes('ocean')) {
                  storyGame.currentScene = 'ocean';
                  updatedLocation = 'beach_shore';
                  message = 'Town completed! You arrive at the mystical ocean.';
                } else {
                  message = 'Town completed! Explore more to unlock new paths.';
                }
                coinsEarned = 50;
                experienceEarned = 50;
              } else if (storyGame.currentScene === 'ocean') {
                // Ocean can branch to mountain or desert
                if (unlockedScenes.includes('desert')) {
                  storyGame.currentScene = 'desert';
                  updatedLocation = 'oasis';
                  message = 'Ocean completed! You arrive at the ancient desert.';
                } else if (unlockedScenes.includes('mountain')) {
                  storyGame.currentScene = 'mountain';
                  updatedLocation = 'mountain_base';
                  message = 'Ocean completed! You reach the mountain peak.';
                } else {
                  message = 'Ocean completed! Make choices to unlock new paths.';
                }
                coinsEarned = 50;
                experienceEarned = 50;
              } else if (storyGame.currentScene === 'mountain') {
                // Mountain can branch to desert
                if (unlockedScenes.includes('desert')) {
                  storyGame.currentScene = 'desert';
                  updatedLocation = 'oasis';
                  message = 'Mountain completed! You arrive at the ancient desert.';
                } else {
                  message = 'Mountain completed! Make choices to unlock the desert.';
                }
                coinsEarned = 50;
                experienceEarned = 50;
              } else if (storyGame.currentScene === 'desert') {
                message = 'Congratulations! You completed all scenes! You are a true coding adventurer!';
                coinsEarned = 100;
                experienceEarned = 100;
              } else {
                message = 'Congratulations! You completed all scenes!';
                coinsEarned = 100;
                experienceEarned = 100;
              }
            }
          }
        }
      } else {
        message = 'You need a key to open the door!';
        result.success = false;
      }
    } else if (result.action === 'move' && result.location) {
      const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
      if (scene.locations.includes(result.location)) {
        // Check if this is a dangerous location
        const dangerousLocation = DANGEROUS_LOCATIONS[result.location];
        if (dangerousLocation && dangerousLocation.scene === storyGame.currentScene) {
          // Check if player has required item(s): support multiple requiredItems or single requiredItem
          const inventoryNames = storyGame.inventory.map((item: { name: string }) => item.name);
          const hasRequiredItems = dangerousLocation.requiredItems
            ? dangerousLocation.requiredItems.every((itemName: string) => inventoryNames.includes(itemName))
            : dangerousLocation.requiredItem
              ? inventoryNames.includes(dangerousLocation.requiredItem)
              : true;
          
          if (!hasRequiredItems) {
            // Player dies - reset to scene start
            const reset = resetToSceneStart(storyGame);
            updatedLocation = reset.location;
            storyGame.isDead = true;
            storyGame.deathCount = (storyGame.deathCount || 0) + 1;
            storyGame.lastDeathLocation = result.location;
            
            // Return death response
            storyGame.currentLocation = updatedLocation;
            storyGame.isDead = false; // Reset death flag after setting location
            storyGame.lastActive = new Date();
            await storyGame.save();
            
            return Response.json({
              success: false,
              action: 'death',
              message: dangerousLocation.deathMessage,
              deathMessage: dangerousLocation.deathMessage,
              resetLocation: updatedLocation,
              newLocation: updatedLocation,
              newScene: storyGame.currentScene,
              newInventory: storyGame.inventory.map((item: { name: string }) => item.name),
              coinsEarned: 0,
              experienceEarned: 0,
              deathCount: storyGame.deathCount,
            });
          } else {
            // Player has required item - safe passage
            updatedLocation = result.location;
            message = dangerousLocation.safeMessage;
            coinsEarned = 10;
            experienceEarned = 15;
          }
        } else {
          // Normal location - safe to move
          updatedLocation = result.location;
          message = `You moved to ${result.location.replace(/_/g, ' ')}.`;
          coinsEarned = 5;
        }
      } else {
        message = 'Invalid location!';
        result.success = false;
      }
    } else if (result.action === 'collect' && result.item) {
      const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
      // Check if item is available at current location (use updatedLocation if move happened first)
      const checkLocation = updatedLocation || storyGame.currentLocation;
      // Type-safe access to locationItems
      const locationItems: string[] = (() => {
        const locationItemsObj = scene.locationItems as Record<string, string[]>;
        return locationItemsObj[checkLocation] || [];
      })();
      
      if (!scene.items.includes(result.item)) {
        message = `A ${result.item} is not available in this scene.`;
        result.success = false;
      } else if (!locationItems.includes(result.item)) {
        message = `A ${result.item} is not available at this location. Try exploring other locations!`;
        result.success = false;
      } else {
        // Check if already collected
        const alreadyCollected = storyGame.inventory.some(item => item.name === result.item);
        if (!alreadyCollected) {
          updatedInventory.push({
            name: result.item,
            description: `A ${result.item} found in the ${storyGame.currentScene}.`,
            collectedAt: new Date(),
          });
          message = `You collected a ${result.item}! 🎉`;
          coinsEarned = 15;
          experienceEarned = 20;
        } else {
          message = `You already have a ${result.item}!`;
        }
      }
    } else if (result.action === 'choose_path' && result.choiceId) {
      // Handle path choice at decision points
      const decisionPoint = DECISION_POINTS[storyGame.currentLocation];
      if (decisionPoint) {
        const choice = decisionPoint.choices.find(c => c.id === result.choiceId);
        if (!choice) {
          // Choice doesn't exist at this location
          const availableChoiceIds = decisionPoint.choices.map(c => c.id).join(', ');
          message = `Invalid choice! Available choices at this location are: ${availableChoiceIds}. Use choose_path("choice_id") with one of these.`;
          result.success = false;
        } else {
          const storyGameForChoice = {
            inventory: storyGame.inventory,
            choices: storyGame.choices || [],
            storyFlags: storyGame.storyFlags || [],
          };
          if (!isChoiceAvailable(choice, storyGameForChoice)) {
            message = 'That choice is not available here. You may need an item, a prior decision, or to have helped someone first.';
            result.success = false;
          } else if (choice.requiredItem) {
            const hasItem = storyGame.inventory.some(item => item.name === choice.requiredItem);
            if (!hasItem) {
              message = `You need a ${choice.requiredItem} to choose this path!`;
              result.success = false;
            } else {
              // Record the choice
              storyGame.choices.push({
                scene: storyGame.currentScene,
                location: storyGame.currentLocation,
                choice: result.choiceId,
                chosenAt: new Date(),
              });
              if (choice.setsFlag) {
                if (!storyGame.storyFlags) storyGame.storyFlags = [];
                if (!storyGame.storyFlags.includes(choice.setsFlag)) storyGame.storyFlags.push(choice.setsFlag);
              }
              // Unlock scene if specified
              if (choice.unlocksScene && !storyGame.unlockedScenes.includes(choice.unlocksScene)) {
                storyGame.unlockedScenes.push(choice.unlocksScene);
              }
              
              // Move to next scene/location if specified
              if (choice.nextScene) {
                storyGame.currentScene = choice.nextScene as any;
                updatedLocation = choice.nextLocation || (SCENES[choice.nextScene as keyof typeof SCENES]?.locations[0] || storyGame.currentLocation);
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                message = `${baseMessage} You arrive at the ${SCENES[choice.nextScene as keyof typeof SCENES]?.name || choice.nextScene}. Explore the area with move_to() or look for items to collect!`;
                coinsEarned = 30;
                experienceEarned = 30;
              } else if (choice.nextLocation) {
                updatedLocation = choice.nextLocation;
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                const nextScene = SCENES[storyGame.currentScene as keyof typeof SCENES];
                const nextLocationName = choice.nextLocation.replace(/_/g, ' ');
                message = `${baseMessage} You're now at ${nextLocationName}. Try exploring with move_to() or look for items to collect!`;
                coinsEarned = 15;
                experienceEarned = 15;
              } else {
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                message = `${baseMessage} Continue exploring this area or look for new paths!`;
                coinsEarned = 10;
                experienceEarned = 10;
              }
              if (updatedLocation === 'beach_shore' && (storyGame.storyFlags || []).includes('helped_merchant')) {
                message += " The merchant's map led you here.";
              }
              if (choice.id === 'peaceful_ending') {
                storyGame.ending = 'peaceful';
                storyGame.endingReachedAt = new Date();
              } else if (choice.id === 'treasure_escape_ending') {
                storyGame.ending = 'treasure_escape';
                storyGame.endingReachedAt = new Date();
              }
            }
          } else {
            // No item required, just record choice
            storyGame.choices.push({
              scene: storyGame.currentScene,
              location: storyGame.currentLocation,
              choice: result.choiceId,
              chosenAt: new Date(),
            });
            if (choice.setsFlag) {
              if (!storyGame.storyFlags) storyGame.storyFlags = [];
              if (!storyGame.storyFlags.includes(choice.setsFlag)) storyGame.storyFlags.push(choice.setsFlag);
            }
            if (choice.unlocksScene && !storyGame.unlockedScenes.includes(choice.unlocksScene)) {
              storyGame.unlockedScenes.push(choice.unlocksScene);
            }
            if (choice.nextScene) {
                storyGame.currentScene = choice.nextScene as any;
                updatedLocation = choice.nextLocation || (SCENES[choice.nextScene as keyof typeof SCENES]?.locations[0] || storyGame.currentLocation);
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                message = `${baseMessage} You arrive at the ${SCENES[choice.nextScene as keyof typeof SCENES]?.name || choice.nextScene}. Explore the area with move_to() or look for items to collect!`;
                coinsEarned = 30;
                experienceEarned = 30;
              } else if (choice.nextLocation) {
                updatedLocation = choice.nextLocation;
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                const nextLocationName = choice.nextLocation.replace(/_/g, ' ');
                message = `${baseMessage} You're now at ${nextLocationName}. Try exploring with move_to() or look for items to collect!`;
                coinsEarned = 15;
                experienceEarned = 15;
              } else {
                const baseMessage = choice.message || `You chose: ${choice.description}`;
                message = `${baseMessage} Continue exploring this area or look for new paths!`;
                coinsEarned = 10;
                experienceEarned = 10;
              }
              if (updatedLocation === 'beach_shore' && (storyGame.storyFlags || []).includes('helped_merchant')) {
                message += " The merchant's map led you here.";
              }
              if (choice.id === 'peaceful_ending') {
                storyGame.ending = 'peaceful';
                storyGame.endingReachedAt = new Date();
              } else if (choice.id === 'treasure_escape_ending') {
                storyGame.ending = 'treasure_escape';
                storyGame.endingReachedAt = new Date();
              }
          }
        }
      } else {
        // No decision point at this location - provide helpful message
        const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
        const currentIndex = scene.locations.indexOf(storyGame.currentLocation);
        if (currentIndex < scene.locations.length - 1) {
          message = 'No decision point here. Try using move_to() to explore other locations, or use open_door() if you have a key!';
        } else {
          message = 'You\'re at the end of this scene! Try using open_door() to advance to the next scene, or explore other locations with move_to().';
        }
        result.success = false;
      }
    } else if (result.action === 'message' && result.text) {
      message = result.text;
    } else if (result.action === 'hypnotize_dragon' && result.success) {
      const atDragonLair = storyGame.currentScene === 'castle' && storyGame.currentLocation === 'dragon_lair';
      const hasMagicGem = updatedInventory.some((item: { name: string }) => item.name === 'magic_gem');
      if (!atDragonLair) {
        message = 'You need to be at the dragon lair to hypnotize the dragon! Use move_to("dragon_lair") first.';
        result.success = false;
      } else if (!hasMagicGem) {
        message = "You need the magic gem from the desert temple to hypnotize the dragon!";
        result.success = false;
      } else {
        storyGame.dragonHypnotized = true;
        if (!storyGame.storyFlags) storyGame.storyFlags = [];
        if (!storyGame.storyFlags.includes('hypnotized_dragon')) storyGame.storyFlags.push('hypnotized_dragon');
        message = 'You use the magic gem and the dragon falls into a trance!';
        coinsEarned = 15;
        experienceEarned = 15;
      }
    } else if (result.action === 'fight_dragon' && result.success) {
      const atDragonLair = storyGame.currentScene === 'castle' && storyGame.currentLocation === 'dragon_lair';
      const invNames = updatedInventory.map((item: { name: string }) => item.name);
      const hasSword = invNames.includes('sword');
      const hasShield = invNames.includes('shield');
      const hasCrown = invNames.includes('crown');
      const dragonHypnotized = !!storyGame.dragonHypnotized;
      const alreadyDefeated = !!storyGame.dragonDefeated;

      if (alreadyDefeated) {
        message = "You've already defeated the dragon!";
        result.success = false;
      } else if (!atDragonLair) {
        message = 'You can only fight the dragon from the dragon lair! Use move_to("dragon_lair") first.';
        result.success = false;
      } else if (!dragonHypnotized) {
        message = 'Hypnotize the dragon with the magic gem first! Use hypnotize_dragon().';
        result.success = false;
      } else if (!hasSword || !hasShield || !hasCrown) {
        const missing = [];
        if (!hasSword) missing.push('sword');
        if (!hasShield) missing.push('shield');
        if (!hasCrown) missing.push('crown (from the castle tower)');
        message = `You need ${missing.join(', ')} to fight the dragon!`;
        result.success = false;
      } else {
        storyGame.dragonDefeated = true;
        storyGame.ending = 'dragon_defeated';
        storyGame.endingReachedAt = new Date();
        message = "With the dragon hypnotized, you strike with your sword and shield! The crown's power seals the victory! You defeat the dragon!";
        coinsEarned = 100;
        experienceEarned = 50;
        storyGame.lastActive = new Date();
        await storyGame.save();
        const user = await User.findById(userId);
        if (!user) {
          return Response.json({ message: 'User not found' }, { status: 404 });
        }
        user.coins += coinsEarned;
        user.experience += experienceEarned;
        if (user.experience >= user.level * 100) {
          user.level += 1;
          user.coins += 50;
        }
        await user.save();
        const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
        const locationItems: string[] = (scene.locationItems as Record<string, string[]>)[storyGame.currentLocation] || [];
        const finalAvailableItems = locationItems.filter(
          (itemName: string) => !storyGame.inventory.some((i: { name: string }) => i.name === itemName)
        );
        const endingConfig = ENDINGS.dragon_defeated;
        return Response.json({
          success: true,
          message,
          action: 'fight_dragon',
          dragonDefeated: true,
          newLocation: storyGame.currentLocation,
          newScene: storyGame.currentScene,
          newInventory: storyGame.inventory.map((i: { name: string }) => i.name),
          availableItems: finalAvailableItems,
          coinsEarned,
          experienceEarned,
          userCoins: user.coins,
          userExperience: user.experience,
          userLevel: user.level,
          storyProgress: storyGame.storyProgress,
          endingId: endingConfig.id,
          endingTitle: endingConfig.title,
          endingMessage: endingConfig.message,
        });
      }
    } else if (result.action === 'continue') {
      message = result.output || 'Code executed successfully!';
    }
    
    // Update story game progress
    storyGame.currentLocation = updatedLocation;
    storyGame.inventory = updatedInventory;
    
    // Initialize arrays if they don't exist
    if (!storyGame.choices) {
      storyGame.choices = [];
    }
    if (!storyGame.unlockedScenes) {
      storyGame.unlockedScenes = [];
    }
    if (!Array.isArray(storyGame.visitedLocations)) {
      storyGame.visitedLocations = [];
    }
    // Backfill for existing saves: ensure current location is in visited
    if (storyGame.visitedLocations.length === 0 && storyGame.currentLocation) {
      storyGame.visitedLocations = [storyGame.currentLocation];
    }
    // Record this location as visited (and any new location we're moving to)
    if (!storyGame.visitedLocations.includes(updatedLocation)) {
      storyGame.visitedLocations.push(updatedLocation);
    }
    
    // Update story progress percentage from unique locations visited
    const totalLocations = Object.values(SCENES).reduce((sum, scene) => sum + scene.locations.length, 0);
    const uniqueVisited = storyGame.visitedLocations.filter((loc: string) =>
      Object.values(SCENES).some(scene => scene.locations.includes(loc))
    );
    storyGame.storyProgress = Math.min(100, Math.round((uniqueVisited.length / totalLocations) * 100));
    
    storyGame.lastActive = new Date();
    await storyGame.save();
    
    // Update user coins and experience
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    if (result.success) {
      user.coins += coinsEarned;
      user.experience += experienceEarned;
      
      // Level up check
      if (user.experience >= user.level * 100) {
        user.level += 1;
        user.coins += 50; // Bonus coins for leveling up
      }
      
      await user.save();
    }
    
    // Get available items at current location
    const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
    // Type-safe access to locationItems
    const locationItems: string[] = (() => {
      const locationItemsObj = scene.locationItems as Record<string, string[]>;
      return locationItemsObj[updatedLocation] || [];
    })();
    const availableItems = locationItems.filter(itemName => {
      // Only show items that haven't been collected
      return !updatedInventory.some(invItem => invItem.name === itemName);
    });
    
    // Ensure availableItems is always an array
    const finalAvailableItems = Array.isArray(availableItems) ? availableItems : [];
    
    console.log('Available items calculation:', {
      scene: storyGame.currentScene,
      location: updatedLocation,
      locationItems,
      updatedInventory: updatedInventory.map(i => i.name),
      availableItems: finalAvailableItems,
      sceneConfig: scene.locationItems,
      locationItemsConfig: (() => {
        const locationItemsObj = scene.locationItems as Record<string, string[]>;
        return locationItemsObj[updatedLocation] || [];
      })()
    });

    const endingConfig = storyGame.ending ? ENDINGS[storyGame.ending] : null;
    return Response.json({
      success: result.success,
      message,
      action: result.action,
      newLocation: updatedLocation,
      newScene: storyGame.currentScene,
      newInventory: updatedInventory.map(item => item.name),
      availableItems: finalAvailableItems,
      coinsEarned,
      experienceEarned,
      userCoins: user.coins,
      userExperience: user.experience,
      userLevel: user.level,
      storyProgress: storyGame.storyProgress,
      ...(endingConfig ? { endingId: endingConfig.id, endingTitle: endingConfig.title, endingMessage: endingConfig.message } : {}),
    });
  } catch (error: any) {
    console.error('Execute code error:', error);
    return Response.json({ 
      message: `Code execution failed: ${error.message}` 
    }, { status: 400 });
  }
}
