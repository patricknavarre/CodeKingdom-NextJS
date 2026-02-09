// Story scenes configuration - shared across story game API routes
// Decision points: locations where players can make choices that affect the story

// Dangerous locations: places where players can die if they don't have required items
export const DANGEROUS_LOCATIONS: Record<string, {
  requiredItem?: string;
  requiredItems?: string[];
  deathMessage: string;
  safeMessage: string;
  scene: string;
}> = {
  dragon_lair: {
    requiredItems: ['sword', 'shield'],
    deathMessage: "💀 The dragon's fire engulfs you! You needed a sword and shield to face the dragon...",
    safeMessage: "Your sword and shield protect you! The dragon retreats.",
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

// Choice type with optional branching fields
export type DecisionChoice = {
  id: string;
  description: string;
  requiredItem?: string;
  unlocksScene?: string;
  unlocksLocation?: string;
  nextScene?: string;
  nextLocation?: string;
  message?: string;
  setsFlag?: string; // when chosen, add this flag to story state
  requiredFlag?: string; // show only if player has this flag
  requiredChoice?: { location: string; choice: string }; // show only if player made this choice at this location
};

export const DECISION_POINTS: Record<string, {
  location: string;
  choices: DecisionChoice[];
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
  dragon_lair: {
    location: 'dragon_lair',
    choices: [
      {
        id: 'peaceful_ending',
        description: 'Make peace with the dragon (after hypnotizing it)',
        requiredFlag: 'hypnotized_dragon',
        message: 'You offer peace instead of violence. The dragon agrees and the kingdom is safe.',
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
        id: 'travel_to_castle',
        description: 'Travel to the castle to face the dragon',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
        message: 'You head to the castle! Once there, use move_to("castle_courtyard") then move_to("dragon_lair") to face the dragon. Make sure you have both sword and shield!',
      },
      {
        id: 'help_merchant',
        description: 'Help the merchant (requires bread)',
        requiredItem: 'bread',
        unlocksScene: 'ocean',
        message: 'The merchant rewards you with a map to the ocean!',
        setsFlag: 'helped_merchant',
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
      {
        id: 'ask_merchant_ocean',
        description: 'Ask the merchant about the ocean (only if you helped them earlier)',
        requiredFlag: 'helped_merchant',
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'The merchant points you to the coast. You set off for the ocean!',
      },
      {
        id: 'treasure_escape_ending',
        description: 'Leave with your treasure and seek new adventures',
        requiredItem: 'treasure_map',
        message: "You slip away with the treasure map. The kingdom's riches await elsewhere!",
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
        message: 'You explore the base but don\'t find anything new. Try climbing the cliff path or looking for items to collect!',
      },
      {
        id: 'travel_to_town',
        description: 'Travel to the town to find a shield',
        nextScene: 'town',
        nextLocation: 'town_gate',
        message: 'You head down the mountain toward the town. Once there, use move_to("town_market") to find the shield!',
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
      {
        id: 'merchant_shortcut',
        description: 'Take the path the merchant described (only if you helped them)',
        requiredChoice: { location: 'town_market', choice: 'help_merchant' },
        nextLocation: 'sand_dunes',
        message: "You remember the merchant's directions and find a shortcut through the dunes!",
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
    items: ['crown'],
    locationItems: {
      'castle_gate': [],
      'castle_courtyard': [],
      'castle_hall': [],
      'castle_tower': ['crown'],
      'dragon_lair': [],
    },
      hints: {
      1: { 
        cost: 10, 
        text: 'Collect a sword and shield before coming to the castle! Get the sword at the mountain base and the shield in the town market.',
        example: 'if "sword" in inventory and "shield" in inventory:'
      },
      2: { 
        cost: 20, 
        text: 'You need both sword and shield to face the dragon. Get the sword from the mountain base and the shield from the town market, then come to the castle.',
        example: 'if "sword" in inventory:\n    if "shield" in inventory:\n        move_to("dragon_lair")'
      },
      3: { 
        cost: 30, 
        text: 'Prepare before the castle: collect the sword at mountain_base and the shield at town_market. Use if/else to check you have both before entering the dragon lair!',
        example: 'if "sword" in inventory and "shield" in inventory:\n    move_to("dragon_lair")\nelse:\n    print("You need sword and shield!")'
      },
    },
  },
  town: {
    name: 'Medieval Town',
    locations: ['town_gate', 'town_square', 'town_market', 'town_exit'],
    items: ['coin', 'bread', 'potion', 'shield'],
    locationItems: {
      'town_gate': [],
      'town_square': ['coin'],
      'town_market': ['bread', 'potion', 'shield'],
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
        text: 'Move to different locations using move_to("location_name"), then use if to check where you are. Helping the merchant can open new options later!',
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
    items: ['rope', 'torch', 'crystal', 'sword'],
    locationItems: {
      'mountain_base': ['sword'],
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
    items: ['water', 'artifact', 'scroll', 'magic_gem'],
    locationItems: {
      'oasis': [],
      'sand_dunes': ['water'],
      'ancient_ruins': ['artifact'],
      'temple': ['scroll', 'magic_gem'],
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

// Multiple endings: id, title, message. Triggered when conditions are met in execute route.
export const ENDINGS: Record<string, { id: string; title: string; message: string }> = {
  dragon_defeated: {
    id: 'dragon_defeated',
    title: 'Dragon Defeated!',
    message: 'You have defeated the dragon and saved the kingdom. The people celebrate your bravery!',
  },
  treasure_escape: {
    id: 'treasure_escape',
    title: 'Treasure Escape',
    message: "You leave with the kingdom's treasure and set off for new adventures.",
  },
  peaceful: {
    id: 'peaceful',
    title: 'Peaceful Resolution',
    message: 'You brokered peace with the dragon using the magic gem. The kingdom is safe without bloodshed.',
  },
};

// Book-like narrative for each location. Value can be a string or { default, helped_merchant? }.
export const LOCATION_NARRATIVE: Record<string, string | { default: string; helped_merchant?: string }> = {
  forest_entrance: 'Tall trees loom on either side of the path. Somewhere in this forest lies a key—and a door that needs opening.',
  forest_path: 'The path winds deeper into the woods. Birds call from the canopy; something glints between the ferns ahead.',
  forest_clearing: 'Sun breaks through the leaves into a peaceful clearing. A good place to rest—or to press on toward the forest exit.',
  forest_exit: 'The trees thin. Before you: paths to the castle, the town, or the mountains. Your choice will shape the journey.',
  castle_gate: 'The ancient castle rises before you, stone worn by years. The gate stands open. Inside, a courtyard and the promise of danger—or glory.',
  castle_courtyard: 'Stone walls enclose the courtyard. Ivy climbs the walls; somewhere above, a tower. To one side, the great hall. To the other, the way out.',
  castle_hall: 'Torchlight flickers in the hall. Tapestries tell of kings and dragons. Stairs lead to the tower; the courtyard lies behind you.',
  castle_tower: 'From the tower window you see the whole kingdom. A telescope points to distant shores. Here, among maps and old books, a crown waits.',
  dragon_lair: 'The lair is hot and reeks of smoke. The dragon watches. With the right tools—and courage—you might end this threat for good.',
  town_gate: 'The town gate bustles with travelers. Beyond it: the square, the market, and the chance to gather what you need for the road ahead.',
  town_square: 'The heart of the town. Merchants call out; the market is nearby. Rest here, or seek the gate to other lands.',
  town_market: 'Stalls overflow with bread, potions, and gear. A merchant catches your eye. Helping them might open doors—or maps—later.',
  town_exit: 'The edge of town. From here you can return to the castle, the forest, or follow a map to the ocean—if you earned one.',
  beach_shore: {
    default: 'Waves roll onto the sand. Tide pools and a cave entrance dot the shore. Somewhere, treasure and deeper waters call.',
    helped_merchant: "The merchant's map led you true. The ocean stretches before you—tide pools, a cave, and the promise of treasure.",
  },
  tide_pool: 'Shells and shallow water. You could search here, head for the cave, or return to the main shore.',
  cave_entrance: 'The cave mouth is dark. Deeper in, something glows. You will need light—or magic—to go farther.',
  treasure_cove: 'Hidden among the rocks, the cove holds more than shells. Maps and scrolls point to the mountains and the desert.',
  deep_trench: 'The water presses in. Only a pearl\'s magic could see you through—and perhaps to what lies in the depths.',
  mountain_base: 'The mountain rises ahead. A sword is said to rest here for the worthy. The cliff path and the summit wait above.',
  cliff_path: 'The path is steep. A rope would make the climb safe. Above: the summit and a torch that could light the way.',
  summit: 'You have reached the summit. The world spreads below. A cave holds a crystal; a darker cave demands a torch.',
  cave: 'Crystals gleam in the walls. One might show the path to the desert. The summit and the base are still within reach.',
  dark_cave: 'Darkness swallows the way. Without a torch, this place is death. With one, who knows what you might find.',
  oasis: 'Palms and water in the endless sand. Travelers rest here before the dunes and the ancient ruins.',
  sand_dunes: 'Dunes roll to the horizon. Water is life here. The ruins—and the temple—lie ahead for those who prepare.',
  ancient_ruins: 'Broken stones and old magic. An artifact here might protect you in the temple. The oasis is behind; the temples, ahead.',
  temple: 'A place of scrolls and quiet power. The magic gem waits for those who come prepared. The ancient temple is another step.',
  ancient_temple: 'The heart of the desert\'s mystery. Only the protected may enter. The gem within could change the fate of the kingdom.',
};

const DEFAULT_NARRATIVE = 'You take in your surroundings. The next step is yours.';

/** Returns 1–3 sentence narrative for a location; uses flag variant (e.g. helped_merchant) when present. */
export function getNarrative(location: string, storyFlags?: string[]): string {
  const entry = LOCATION_NARRATIVE[location];
  if (!entry) return DEFAULT_NARRATIVE;
  if (typeof entry === 'string') return entry;
  const flags = storyFlags || [];
  if (flags.includes('helped_merchant') && entry.helped_merchant) return entry.helped_merchant;
  return entry.default;
}
