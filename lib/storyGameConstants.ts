// Story scenes configuration - shared across story game API routes
// Decision points: locations where players can make choices that affect the story

// Dangerous locations: places where players can die if they don't have required items
export const DANGEROUS_LOCATIONS: Record<string, {
  requiredItem: string;
  deathMessage: string;
  safeMessage: string;
  scene: string;
}> = {
  dragon_lair: {
    requiredItem: 'sword',
    deathMessage: "💀 The dragon's fire engulfs you! You should have brought a sword...",
    safeMessage: "Your sword protects you! The dragon retreats.",
    scene: 'castle'
  },
  dark_cave: {
    requiredItem: 'torch',
    deathMessage: "💀 You stumble in the darkness and fall into a deep pit! You needed a torch to see...",
    safeMessage: "Your torch lights the way! You safely navigate the dark cave.",
    scene: 'mountain'
  },
  ancient_temple: {
    requiredItem: 'artifact',
    deathMessage: "💀 The temple's ancient curse strikes you down! You needed an artifact to protect yourself...",
    safeMessage: "The artifact protects you from the curse! You enter the temple safely.",
    scene: 'desert'
  },
  deep_trench: {
    requiredItem: 'pearl',
    deathMessage: "💀 The crushing pressure of the deep ocean overwhelms you! You needed a pearl's magic to survive...",
    safeMessage: "The pearl's magic protects you! You dive deep into the trench.",
    scene: 'ocean'
  },
};

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
    message?: string; // Custom message when this choice is made
  }>;
}> = {
  forest_clearing: {
    location: 'forest_clearing',
    choices: [
      {
        id: 'explore_deep',
        description: 'Explore deeper into the forest',
        nextLocation: 'forest_exit',
        message: 'You discover a hidden path leading out of the forest!',
      },
      {
        id: 'rest_clearing',
        description: 'Rest in the peaceful clearing',
        nextLocation: 'forest_clearing',
        message: 'You take a moment to rest and gather your strength.',
      },
      {
        id: 'back_to_path',
        description: 'Return to the forest path',
        nextLocation: 'forest_path',
      },
    ],
  },
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
      {
        id: 'path_mountain',
        description: 'Follow the winding path to the mountains (requires map)',
        requiredItem: 'map',
        unlocksScene: 'mountain',
        nextScene: 'mountain',
        nextLocation: 'mountain_base',
        message: 'Your map shows a secret path to the mountains!',
      },
      {
        id: 'stay_forest',
        description: 'Stay in the forest and explore more',
        nextLocation: 'forest_clearing',
        message: 'You decide to explore the forest a bit more before leaving.',
      },
    ],
  },
  castle_courtyard: {
    location: 'castle_courtyard',
    choices: [
      {
        id: 'enter_hall',
        description: 'Enter the castle hall',
        nextLocation: 'castle_hall',
      },
      {
        id: 'climb_tower',
        description: 'Climb the tower (requires shield for safety)',
        requiredItem: 'shield',
        nextLocation: 'castle_tower',
        message: 'Your shield protects you from falling debris!',
      },
      {
        id: 'explore_dragon',
        description: 'Investigate the mysterious lair (WARNING: Dangerous!)',
        nextLocation: 'dragon_lair',
        message: 'You hear ominous sounds from the lair...',
      },
      {
        id: 'leave_castle',
        description: 'Leave the castle',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
    ],
  },
  castle_hall: {
    location: 'castle_hall',
    choices: [
      {
        id: 'ascend_tower',
        description: 'Ascend to the tower',
        nextLocation: 'castle_tower',
      },
      {
        id: 'explore_courtyard',
        description: 'Return to the courtyard',
        nextLocation: 'castle_courtyard',
      },
      {
        id: 'search_hall',
        description: 'Search the hall for secrets',
        nextLocation: 'castle_hall',
        message: 'You find ancient writings on the walls, but nothing else.',
      },
    ],
  },
  castle_tower: {
    location: 'castle_tower',
    choices: [
      {
        id: 'explore_ocean',
        description: 'Use the telescope to spot the ocean (requires crown)',
        requiredItem: 'crown',
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'The crown\'s magic reveals a path to the mystical ocean!',
      },
      {
        id: 'continue_town',
        description: 'Leave the castle and go to town',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
      {
        id: 'search_tower',
        description: 'Search the tower for hidden treasures',
        nextLocation: 'castle_tower',
        message: 'You find some old coins but nothing of great value.',
      },
      {
        id: 'return_hall',
        description: 'Return to the castle hall',
        nextLocation: 'castle_hall',
      },
    ],
  },
  town_square: {
    location: 'town_square',
    choices: [
      {
        id: 'visit_market',
        description: 'Visit the bustling market',
        nextLocation: 'town_market',
      },
      {
        id: 'explore_gate',
        description: 'Head to the town gate',
        nextLocation: 'town_gate',
      },
      {
        id: 'rest_square',
        description: 'Rest in the town square',
        nextLocation: 'town_square',
        message: 'You take a moment to observe the town life.',
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
        id: 'buy_potion',
        description: 'Buy a healing potion (requires coin)',
        requiredItem: 'coin',
        nextLocation: 'town_market',
        message: 'You purchase a healing potion from the market!',
      },
      {
        id: 'ignore_merchant',
        description: 'Continue exploring the town',
        nextLocation: 'town_square',
      },
      {
        id: 'leave_town',
        description: 'Leave the town',
        nextLocation: 'town_exit',
      },
    ],
  },
  town_exit: {
    location: 'town_exit',
    choices: [
      {
        id: 'return_castle',
        description: 'Return to the castle',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
      },
      {
        id: 'path_forest',
        description: 'Take the path back to the forest',
        nextScene: 'forest',
        nextLocation: 'forest_entrance',
      },
      {
        id: 'explore_ocean',
        description: 'Follow the map to the ocean (requires map from merchant)',
        requiredItem: 'bread', // If they helped merchant, they got the map
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'You follow the merchant\'s map to the ocean!',
      },
    ],
  },
  beach_shore: {
    location: 'beach_shore',
    choices: [
      {
        id: 'explore_tide_pool',
        description: 'Explore the tide pools',
        nextLocation: 'tide_pool',
      },
      {
        id: 'enter_cave',
        description: 'Enter the mysterious cave',
        nextLocation: 'cave_entrance',
      },
      {
        id: 'search_treasure',
        description: 'Search for treasure along the shore',
        nextLocation: 'treasure_cove',
      },
      {
        id: 'dive_deep',
        description: 'Dive into the deep ocean (WARNING: Requires pearl!)',
        nextLocation: 'deep_trench',
        message: 'The ocean depths call to you...',
      },
    ],
  },
  tide_pool: {
    location: 'tide_pool',
    choices: [
      {
        id: 'continue_shore',
        description: 'Return to the beach shore',
        nextLocation: 'beach_shore',
      },
      {
        id: 'explore_cave',
        description: 'Follow the path to the cave entrance',
        nextLocation: 'cave_entrance',
      },
      {
        id: 'search_pool',
        description: 'Search the tide pool for treasures',
        nextLocation: 'tide_pool',
        message: 'You find interesting shells but nothing magical.',
      },
    ],
  },
  treasure_cove: {
    location: 'treasure_cove',
    choices: [
      {
        id: 'path_mountain',
        description: 'Follow the map to the mountains (requires treasure_map)',
        requiredItem: 'treasure_map',
        unlocksScene: 'mountain',
        nextScene: 'mountain',
        nextLocation: 'mountain_base',
        message: 'The treasure map reveals a path to the mountains!',
      },
      {
        id: 'path_desert',
        description: 'Take the ancient scroll to the desert (requires scroll)',
        requiredItem: 'scroll',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
        message: 'The ancient scroll guides you to the desert!',
      },
      {
        id: 'stay_ocean',
        description: 'Continue exploring the ocean',
        nextLocation: 'beach_shore',
      },
      {
        id: 'search_more',
        description: 'Search for more treasures',
        nextLocation: 'treasure_cove',
        message: 'You search thoroughly but find nothing else.',
      },
    ],
  },
  mountain_base: {
    location: 'mountain_base',
    choices: [
      {
        id: 'climb_cliff',
        description: 'Climb the cliff path (requires rope)',
        requiredItem: 'rope',
        nextLocation: 'cliff_path',
        message: 'Your rope helps you safely climb the cliff!',
      },
      {
        id: 'explore_base',
        description: 'Explore the mountain base',
        nextLocation: 'mountain_base',
        message: 'You find some useful supplies at the base.',
      },
      {
        id: 'return_previous',
        description: 'Return to previous area',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
      },
    ],
  },
  summit: {
    location: 'summit',
    choices: [
      {
        id: 'enter_cave',
        description: 'Enter the crystal cave',
        nextLocation: 'cave',
      },
      {
        id: 'enter_dark_cave',
        description: 'Enter the dark cave (WARNING: Requires torch!)',
        nextLocation: 'dark_cave',
        message: 'The dark cave looks ominous...',
      },
      {
        id: 'descend_cliff',
        description: 'Descend back to the cliff path',
        nextLocation: 'cliff_path',
      },
      {
        id: 'rest_summit',
        description: 'Rest at the summit and enjoy the view',
        nextLocation: 'summit',
        message: 'The view from the summit is breathtaking!',
      },
    ],
  },
  mountain_cave: {
    location: 'cave',
    choices: [
      {
        id: 'path_desert',
        description: 'Use the crystal to find the desert path (requires crystal)',
        requiredItem: 'crystal',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
        message: 'The crystal glows and reveals a path to the desert!',
      },
      {
        id: 'return_summit',
        description: 'Return to the summit',
        nextLocation: 'summit',
      },
      {
        id: 'return_base',
        description: 'Return to the mountain base',
        nextLocation: 'mountain_base',
      },
      {
        id: 'explore_cave',
        description: 'Explore the cave deeper',
        nextLocation: 'cave',
        message: 'You find some interesting rock formations but nothing else.',
      },
    ],
  },
  oasis: {
    location: 'oasis',
    choices: [
      {
        id: 'explore_dunes',
        description: 'Explore the sand dunes',
        nextLocation: 'sand_dunes',
      },
      {
        id: 'search_ruins',
        description: 'Search for ancient ruins',
        nextLocation: 'ancient_ruins',
      },
      {
        id: 'rest_oasis',
        description: 'Rest at the oasis',
        nextLocation: 'oasis',
        message: 'The oasis provides much-needed rest and water.',
      },
      {
        id: 'find_temple',
        description: 'Look for the ancient temple',
        nextLocation: 'temple',
      },
    ],
  },
  sand_dunes: {
    location: 'sand_dunes',
    choices: [
      {
        id: 'continue_ruins',
        description: 'Continue to the ancient ruins',
        nextLocation: 'ancient_ruins',
      },
      {
        id: 'return_oasis',
        description: 'Return to the oasis',
        nextLocation: 'oasis',
      },
      {
        id: 'explore_dunes',
        description: 'Explore the sand dunes more',
        nextLocation: 'sand_dunes',
        message: 'You find some interesting patterns in the sand.',
      },
    ],
  },
  ancient_ruins: {
    location: 'ancient_ruins',
    choices: [
      {
        id: 'enter_temple',
        description: 'Enter the ancient temple (WARNING: Requires artifact!)',
        nextLocation: 'ancient_temple',
        message: 'The ancient temple radiates powerful energy...',
      },
      {
        id: 'visit_temple',
        description: 'Visit the regular temple',
        nextLocation: 'temple',
      },
      {
        id: 'return_oasis',
        description: 'Return to the oasis',
        nextLocation: 'oasis',
      },
      {
        id: 'search_ruins',
        description: 'Search the ruins for artifacts',
        nextLocation: 'ancient_ruins',
        message: 'You carefully search the ruins for anything valuable.',
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
    locations: ['castle_gate', 'castle_courtyard', 'castle_hall', 'castle_tower', 'dragon_lair'],
    items: ['sword', 'shield', 'crown'],
    locationItems: {
      'castle_gate': [],
      'castle_courtyard': ['sword'],
      'castle_hall': ['shield'],
      'castle_tower': ['crown'],
      'dragon_lair': [],
    },
      hints: {
      1: { 
        cost: 10, 
        text: 'You need to collect items to progress! Some locations are dangerous - make sure you have the right equipment. Use if statements to check what you have.',
        example: 'if "sword" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Use collect_item("sword") when you find it, then check your inventory with if statements before entering dangerous areas.',
        example: 'if "sword" in inventory:\n    move_to("castle_hall")'
      },
      3: { 
        cost: 30, 
        text: 'Collect the sword first, then use if/else to check your inventory before moving forward. Some locations require specific items to survive!',
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
    locations: ['beach_shore', 'tide_pool', 'cave_entrance', 'treasure_cove', 'deep_trench'],
    items: ['shell', 'pearl', 'treasure_map'],
    locationItems: {
      'beach_shore': [],
      'tide_pool': ['shell'],
      'cave_entrance': ['pearl'],
      'treasure_cove': ['treasure_map'],
      'deep_trench': [],
    },
      hints: {
      1: { 
        cost: 10, 
        text: 'Use if statements to check if you have items before accessing treasure! Deep ocean trenches are dangerous without protection!',
        example: 'if "treasure_map" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Collect the treasure map first, then use if to check before entering the treasure cove. The deep trench requires a pearl\'s magic to survive!',
        example: 'if "treasure_map" in inventory:\n    move_to("treasure_cove")\nelse:\n    collect_item("treasure_map")'
      },
      3: { 
        cost: 30, 
        text: 'You need the treasure map to access the cove. Use if/else to check your inventory and collect items in the right order. Without a pearl, the deep trench will crush you!',
        example: 'if "pearl" in inventory:\n    move_to("deep_trench")\nelse:\n    if "treasure_map" in inventory:\n        move_to("treasure_cove")\n        open_door()\n    else:\n        collect_item("pearl")'
      },
    },
  },
  mountain: {
    name: 'Mountain Peak',
    locations: ['mountain_base', 'cliff_path', 'summit', 'cave', 'dark_cave'],
    items: ['rope', 'torch', 'crystal'],
    locationItems: {
      'mountain_base': [],
      'cliff_path': ['rope'],
      'summit': ['torch'],
      'cave': ['crystal'],
      'dark_cave': [],
    },
      hints: {
      1: { 
        cost: 10, 
        text: 'Use if statements to check if you have the right equipment before climbing! Some locations are dangerous without proper gear.',
        example: 'if "rope" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'You need a rope to safely climb. Use if/else to check your inventory before moving to dangerous locations. Dark caves require a torch!',
        example: 'if "rope" in inventory:\n    move_to("cliff_path")\nelse:\n    collect_item("rope")'
      },
      3: { 
        cost: 30, 
        text: 'Safety first! Use if/else to ensure you have the rope before climbing, and the torch before entering dark caves. Without a torch, dark caves are deadly!',
        example: 'if "rope" in inventory:\n    if "torch" in inventory:\n        move_to("dark_cave")\n    else:\n        move_to("summit")\n        collect_item("torch")\nelse:\n    move_to("cliff_path")\n    collect_item("rope")'
      },
    },
  },
  desert: {
    name: 'Ancient Desert',
    locations: ['oasis', 'sand_dunes', 'ancient_ruins', 'temple', 'ancient_temple'],
    items: ['water', 'artifact', 'scroll'],
    locationItems: {
      'oasis': [],
      'sand_dunes': ['water'],
      'ancient_ruins': ['artifact'],
      'temple': ['scroll'],
      'ancient_temple': [],
    },
      hints: {
      1: { 
        cost: 10, 
        text: 'Survival in the desert requires water! Use if statements to check your resources. Some ancient places require protection!',
        example: 'if "water" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'Collect water first, then use if/else to manage your resources before exploring dangerous areas. Ancient temples are deadly without an artifact!',
        example: 'if "water" in inventory:\n    move_to("ancient_ruins")\nelse:\n    move_to("sand_dunes")\n    collect_item("water")'
      },
      3: { 
        cost: 30, 
        text: 'Resource management is key! Use nested if/else to check for water before exploring, and artifacts before entering ancient temples. Without an artifact, the temple curse will strike!',
        example: 'if "water" in inventory:\n    if "artifact" in inventory:\n        move_to("ancient_temple")\n    else:\n        move_to("ancient_ruins")\n        collect_item("artifact")\nelse:\n    move_to("sand_dunes")\n    collect_item("water")'
      },
    },
  },
};
