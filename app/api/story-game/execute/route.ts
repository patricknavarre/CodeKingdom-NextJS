import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import User from '@/models/userModel';
import { executePython, validatePythonCode } from '@/services/pythonExecutor';
import { SCENES, DECISION_POINTS } from '@/lib/storyGameConstants';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

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
    const result = await executePython(code, context);
    
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
          // Scene completed - check if there's a decision point here
          const decisionPoint = DECISION_POINTS[storyGame.currentLocation];
          if (decisionPoint && decisionPoint.choices.length > 0) {
            // There are choices available - don't auto-advance, let player choose
            message = 'You\'ve reached a decision point! Use choose_path("choice_id") to make your choice.';
            coinsEarned = 20;
            experienceEarned = 25;
          } else {
            // No decision point, check unlocked scenes or default progression
            const unlockedScenes = storyGame.unlockedScenes || [];
            
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
                if (unlockedScenes.includes('town')) {
                  storyGame.currentScene = 'town';
                  updatedLocation = 'town_gate';
                  message = 'Forest completed! You head to the town.';
                } else {
                  storyGame.currentScene = 'castle';
                  updatedLocation = 'castle_gate';
                  message = 'Forest completed! You enter the castle.';
                }
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
        updatedLocation = result.location;
        message = `You moved to ${result.location.replace(/_/g, ' ')}.`;
        coinsEarned = 5;
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
        if (choice) {
          // Check if choice requires an item
          if (choice.requiredItem) {
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
              
              // Unlock scene if specified
              if (choice.unlocksScene && !storyGame.unlockedScenes.includes(choice.unlocksScene)) {
                storyGame.unlockedScenes.push(choice.unlocksScene);
              }
              
              // Move to next scene/location if specified
              if (choice.nextScene) {
                storyGame.currentScene = choice.nextScene as any;
                updatedLocation = choice.nextLocation || (SCENES[choice.nextScene as keyof typeof SCENES]?.locations[0] || storyGame.currentLocation);
                message = choice.message || `You chose: ${choice.description}`;
                coinsEarned = 30;
                experienceEarned = 30;
              } else if (choice.nextLocation) {
                updatedLocation = choice.nextLocation;
                message = choice.message || `You chose: ${choice.description}`;
                coinsEarned = 15;
                experienceEarned = 15;
              } else {
                message = choice.message || `You chose: ${choice.description}`;
                coinsEarned = 10;
                experienceEarned = 10;
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
            
            if (choice.unlocksScene && !storyGame.unlockedScenes.includes(choice.unlocksScene)) {
              storyGame.unlockedScenes.push(choice.unlocksScene);
            }
            
            if (choice.nextScene) {
              storyGame.currentScene = choice.nextScene as any;
              updatedLocation = choice.nextLocation || (SCENES[choice.nextScene as keyof typeof SCENES]?.locations[0] || storyGame.currentLocation);
              message = choice.message || `You chose: ${choice.description}`;
              coinsEarned = 30;
              experienceEarned = 30;
            } else if (choice.nextLocation) {
              updatedLocation = choice.nextLocation;
              message = choice.message || `You chose: ${choice.description}`;
              coinsEarned = 15;
              experienceEarned = 15;
            } else {
              message = choice.message || `You chose: ${choice.description}`;
              coinsEarned = 10;
              experienceEarned = 10;
            }
          }
        } else {
          message = 'Invalid choice! Check available choices at this location.';
          result.success = false;
        }
      } else {
        message = 'No decision point available at this location.';
        result.success = false;
      }
    } else if (result.action === 'message' && result.text) {
      message = result.text;
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
    
    // Update story progress percentage
    const totalLocations = Object.values(SCENES).reduce((sum, scene) => sum + scene.locations.length, 0);
    const completedLocations = storyGame.completedScenes.length * 4; // Approximate
    storyGame.storyProgress = Math.min(100, Math.round((completedLocations / totalLocations) * 100));
    
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
    });
  } catch (error: any) {
    console.error('Execute code error:', error);
    return Response.json({ 
      message: `Code execution failed: ${error.message}` 
    }, { status: 400 });
  }
}
