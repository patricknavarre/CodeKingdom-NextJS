// Story scenes configuration - shared across story game API routes
// Decision points: locations where players can make choices that affect the story
export const DECISION_POINTS: Record<string, {
  location: string;
  choices: Array<{
    id: string;
    description: string;
    requiredItem?: string; // Item needed to unlock this choice
    unlocksScene?: string; // Scene this choice unlocks
    unlocksLocation?: string; // Location this choice unlocks
    nextScene?: string; // Scene to move to after choice
    nextLocation?: string; // Location to move to after choice
  }>;
}> = {
  forest_exit: {
    location: 'forest_exit',
    choices: [
      {
        id: 'path_castle',
        description: 'Take the path to the ancient castle',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
      },
      {
        id: 'path_town',
        description: 'Head towards the medieval town',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
    ],
  },
  castle_tower: {
    location: 'castle_tower',
    choices: [
      {
        id: 'explore_ocean',
        description: 'Use the telescope to spot the ocean',
        requiredItem: 'crown',
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
      },
      {
        id: 'continue_town',
        description: 'Leave the castle and go to town',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
    ],
  },
  town_market: {
    location: 'town_market',
    choices: [
      {
        id: 'help_merchant',
        description: 'Help the merchant (requires bread)',
        requiredItem: 'bread',
        unlocksScene: 'ocean',
        message: 'The merchant rewards you with a map to the ocean!',
      },
      {
        id: 'ignore_merchant',
        description: 'Continue exploring the town',
        // No special unlock, just continue
      },
    ],
  },
  treasure_cove: {
    location: 'treasure_cove',
    choices: [
      {
        id: 'path_mountain',
        description: 'Follow the map to the mountains',
        requiredItem: 'treasure_map',
        unlocksScene: 'mountain',
        nextScene: 'mountain',
        nextLocation: 'mountain_base',
      },
      {
        id: 'path_desert',
        description: 'Take the ancient scroll to the desert',
        requiredItem: 'scroll',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
      },
    ],
  },
  mountain_cave: {
    location: 'cave',
    choices: [
      {
        id: 'path_desert',
        description: 'Use the crystal to find the desert path',
        requiredItem: 'crystal',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
      },
      {
        id: 'return_base',
        description: 'Return to the mountain base',
        nextLocation: 'mountain_base',
      },
    ],
  },
};

export const SCENES = {
  forest: {
    name: 'Mystical Forest',
    locations: ['forest_entrance', 'forest_path', 'forest_clearing', 'forest_exit'],
    items: ['key', 'map', 'compass'],
    locationItems: {
      'forest_entrance': [],
      'forest_path': ['map'],
      'forest_clearing': ['key', 'compass'],
      'forest_exit': [],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'Try using an if statement to check your inventory!',
        example: 'if "key" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Use: if "key" in inventory: open_door()',
        example: 'if "key" in inventory:\n    open_door()'
      },
      3: { 
        cost: 30, 
        text: 'Check if you have collected the key. If yes, use open_door() to proceed.',
        example: 'if "key" in inventory:\n    open_door()\nelse:\n    print("You need a key!")'
      },
    },
  },
  castle: {
    name: 'Ancient Castle',
    locations: ['castle_gate', 'castle_courtyard', 'castle_hall', 'castle_tower'],
    items: ['sword', 'shield', 'crown'],
    locationItems: {
      'castle_gate': [],
      'castle_courtyard': ['sword'],
      'castle_hall': ['shield'],
      'castle_tower': ['crown'],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'You need to collect items to progress! Use if statements to check what you have.',
        example: 'if "sword" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Use collect_item("sword") when you find it, then check your inventory with if statements.',
        example: 'if "sword" in inventory:\n    move_to("castle_hall")'
      },
      3: { 
        cost: 30, 
        text: 'Collect the sword first, then use if/else to check your inventory before moving forward.',
        example: 'if "sword" in inventory:\n    move_to("castle_hall")\nelse:\n    collect_item("sword")'
      },
    },
  },
  town: {
    name: 'Medieval Town',
    locations: ['town_gate', 'town_square', 'town_market', 'town_exit'],
    items: ['coin', 'bread', 'potion'],
    locationItems: {
      'town_gate': [],
      'town_square': ['coin'],
      'town_market': ['bread', 'potion'],
      'town_exit': [],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'Explore different locations to find items! Use if statements to check your location.',
        example: 'if current_location == "town_market":'
      },
      2: { 
        cost: 20, 
        text: 'Move to different locations using move_to("location_name"), then use if to check where you are.',
        example: 'move_to("town_market")\nif current_location == "town_market":\n    collect_item("bread")'
      },
      3: { 
        cost: 30, 
        text: 'Visit the market to find useful items. Use if/else to collect items based on your location.',
        example: 'if current_location == "town_market":\n    collect_item("bread")\nelse:\n    move_to("town_market")'
      },
    },
  },
  ocean: {
    name: 'Mystical Ocean',
    locations: ['beach_shore', 'tide_pool', 'cave_entrance', 'treasure_cove'],
    items: ['shell', 'pearl', 'treasure_map'],
    locationItems: {
      'beach_shore': [],
      'tide_pool': ['shell'],
      'cave_entrance': ['pearl'],
      'treasure_cove': ['treasure_map'],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'Use if statements to check if you have items before accessing treasure!',
        example: 'if "treasure_map" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Collect the treasure map first, then use if to check before entering the treasure cove.',
        example: 'if "treasure_map" in inventory:\n    move_to("treasure_cove")\nelse:\n    collect_item("treasure_map")'
      },
      3: { 
        cost: 30, 
        text: 'You need the treasure map to access the cove. Use if/else to check your inventory and collect items in the right order.',
        example: 'if "treasure_map" in inventory:\n    move_to("treasure_cove")\n    open_door()\nelse:\n    if "pearl" in inventory:\n        move_to("treasure_cove")\n        collect_item("treasure_map")\n    else:\n        collect_item("pearl")'
      },
    },
  },
  mountain: {
    name: 'Mountain Peak',
    locations: ['mountain_base', 'cliff_path', 'summit', 'cave'],
    items: ['rope', 'torch', 'crystal'],
    locationItems: {
      'mountain_base': [],
      'cliff_path': ['rope'],
      'summit': ['torch'],
      'cave': ['crystal'],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'Use if statements to check if you have the right equipment before climbing!',
        example: 'if "rope" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'You need a rope to safely climb. Use if/else to check your inventory before moving to dangerous locations.',
        example: 'if "rope" in inventory:\n    move_to("cliff_path")\nelse:\n    collect_item("rope")'
      },
      3: { 
        cost: 30, 
        text: 'Safety first! Use if/else to ensure you have the rope before climbing, and the torch before entering the cave.',
        example: 'if "rope" in inventory:\n    if "torch" in inventory:\n        move_to("cave")\n    else:\n        move_to("summit")\n        collect_item("torch")\nelse:\n    move_to("cliff_path")\n    collect_item("rope")'
      },
    },
  },
  desert: {
    name: 'Ancient Desert',
    locations: ['oasis', 'sand_dunes', 'ancient_ruins', 'temple'],
    items: ['water', 'artifact', 'scroll'],
    locationItems: {
      'oasis': [],
      'sand_dunes': ['water'],
      'ancient_ruins': ['artifact'],
      'temple': ['scroll'],
    },
    hints: {
      1: { 
        cost: 10, 
        text: 'Survival in the desert requires water! Use if statements to check your resources.',
        example: 'if "water" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Collect water first, then use if/else to manage your resources before exploring dangerous areas.',
        example: 'if "water" in inventory:\n    move_to("ancient_ruins")\nelse:\n    move_to("sand_dunes")\n    collect_item("water")'
      },
      3: { 
        cost: 30, 
        text: 'Resource management is key! Use nested if/else to check for water before exploring, and artifacts before entering the temple.',
        example: 'if "water" in inventory:\n    if "artifact" in inventory:\n        move_to("temple")\n        collect_item("scroll")\n    else:\n        move_to("ancient_ruins")\n        collect_item("artifact")\nelse:\n    move_to("sand_dunes")\n    collect_item("water")'
      },
    },
  },
};
