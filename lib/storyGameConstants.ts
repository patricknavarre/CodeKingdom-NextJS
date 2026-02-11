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
  /** CYOA-style hint shown in UI: e.g. "If you enter the hall, run choose_path('enter_hall')." */
  codeHint?: string;
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
        codeHint: 'If you venture deeper, run choose_path("explore_deep").',
        nextLocation: 'forest_exit',
        message: 'You discover a hidden path leading out of the forest!',
      },
      {
        id: 'rest_clearing',
        description: 'Rest in the peaceful clearing',
        codeHint: 'If you rest here, run choose_path("rest_clearing").',
        nextLocation: 'forest_clearing',
        message: 'You take a moment to rest and gather your strength.',
      },
      {
        id: 'back_to_path',
        description: 'Return to the forest path',
        codeHint: 'If you turn back, run choose_path("back_to_path").',
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
        codeHint: 'If you go to the castle, run choose_path("path_castle").',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
      },
      {
        id: 'path_town',
        description: 'Head towards the medieval town',
        codeHint: 'If you head to the town, run choose_path("path_town").',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
      {
        id: 'path_mountain',
        description: 'Follow the winding path to the mountains (requires map)',
        codeHint: 'If you have the map and go to the mountains, run choose_path("path_mountain").',
        requiredItem: 'map',
        unlocksScene: 'mountain',
        nextScene: 'mountain',
        nextLocation: 'mountain_base',
        message: 'Your map shows a secret path to the mountains!',
      },
      {
        id: 'stay_forest',
        description: 'Stay in the forest and explore more',
        codeHint: 'If you stay in the forest, run choose_path("stay_forest").',
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
        codeHint: 'If you enter the hall, run choose_path("enter_hall").',
        nextLocation: 'castle_hall',
      },
      {
        id: 'climb_tower',
        description: 'Climb the tower (requires shield for safety)',
        codeHint: 'If you have a shield and climb the tower, run choose_path("climb_tower").',
        requiredItem: 'shield',
        nextLocation: 'castle_tower',
        message: 'Your shield protects you from falling debris!',
      },
      {
        id: 'explore_dragon',
        description: 'Investigate the mysterious lair (WARNING: Dangerous!)',
        codeHint: 'If you dare enter the lair, run choose_path("explore_dragon"). You will need sword and shield to survive.',
        nextLocation: 'dragon_lair',
        message: 'You hear ominous sounds from the lair...',
      },
      {
        id: 'leave_castle',
        description: 'Leave the castle',
        codeHint: 'If you leave the castle, run choose_path("leave_castle").',
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
        codeHint: 'If you ascend to the tower, run choose_path("ascend_tower").',
        nextLocation: 'castle_tower',
      },
      {
        id: 'explore_courtyard',
        description: 'Return to the courtyard',
        codeHint: 'If you return to the courtyard, run choose_path("explore_courtyard").',
        nextLocation: 'castle_courtyard',
      },
      {
        id: 'search_hall',
        description: 'Search the hall for secrets',
        codeHint: 'If you search the hall, run choose_path("search_hall").',
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
        codeHint: 'If you have the crown and wish to find the ocean, run choose_path("explore_ocean").',
        requiredItem: 'crown',
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'The crown\'s magic reveals a path to the mystical ocean!',
      },
      {
        id: 'continue_town',
        description: 'Leave the castle and go to town',
        codeHint: 'If you leave for the town, run choose_path("continue_town").',
        nextScene: 'town',
        nextLocation: 'town_gate',
      },
      {
        id: 'search_tower',
        description: 'Search the tower for hidden treasures',
        codeHint: 'If you search the tower, run choose_path("search_tower").',
        nextLocation: 'castle_tower',
        message: 'You find some old coins but nothing of great value.',
      },
      {
        id: 'return_hall',
        description: 'Return to the castle hall',
        codeHint: 'If you return to the hall, run choose_path("return_hall").',
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
        codeHint: 'If you have hypnotized the dragon and choose peace, run choose_path("peaceful_ending").',
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
        codeHint: 'If you visit the market, run choose_path("visit_market").',
        nextLocation: 'town_market',
      },
      {
        id: 'explore_gate',
        description: 'Head to the town gate',
        codeHint: 'If you head to the gate, run choose_path("explore_gate").',
        nextLocation: 'town_gate',
      },
      {
        id: 'rest_square',
        description: 'Rest in the town square',
        codeHint: 'If you rest in the square, run choose_path("rest_square").',
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
        codeHint: 'If you go to the castle, run choose_path("travel_to_castle"). Have sword and shield before facing the dragon!',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
        message: 'You head to the castle! Once there, use move_to("castle_courtyard") then move_to("dragon_lair") to face the dragon. Make sure you have both sword and shield!',
      },
      {
        id: 'help_merchant',
        description: 'Help the merchant (requires bread)',
        codeHint: 'If you have bread and help the merchant, run choose_path("help_merchant").',
        requiredItem: 'bread',
        unlocksScene: 'ocean',
        message: 'The merchant rewards you with a map to the ocean!',
        setsFlag: 'helped_merchant',
      },
      {
        id: 'buy_potion',
        description: 'Buy a healing potion (requires coin)',
        codeHint: 'If you have a coin and buy a potion, run choose_path("buy_potion").',
        requiredItem: 'coin',
        nextLocation: 'town_market',
        message: 'You purchase a healing potion from the market!',
      },
      {
        id: 'ignore_merchant',
        description: 'Continue exploring the town',
        codeHint: 'If you ignore the merchant, run choose_path("ignore_merchant").',
        nextLocation: 'town_square',
      },
      {
        id: 'leave_town',
        description: 'Leave the town',
        codeHint: 'If you leave the town, run choose_path("leave_town").',
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
        codeHint: 'If you return to the castle, run choose_path("return_castle").',
        nextScene: 'castle',
        nextLocation: 'castle_gate',
      },
      {
        id: 'path_forest',
        description: 'Take the path back to the forest',
        codeHint: 'If you go back to the forest, run choose_path("path_forest").',
        nextScene: 'forest',
        nextLocation: 'forest_entrance',
      },
      {
        id: 'explore_ocean',
        description: 'Follow the map to the ocean (requires map from merchant)',
        codeHint: 'If you have the map and go to the ocean, run choose_path("explore_ocean").',
        requiredItem: 'bread', // If they helped merchant, they got the map
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'You follow the merchant\'s map to the ocean!',
      },
      {
        id: 'ask_merchant_ocean',
        description: 'Ask the merchant about the ocean (only if you helped them earlier)',
        codeHint: 'If you helped the merchant and ask about the ocean, run choose_path("ask_merchant_ocean").',
        requiredFlag: 'helped_merchant',
        unlocksScene: 'ocean',
        nextScene: 'ocean',
        nextLocation: 'beach_shore',
        message: 'The merchant points you to the coast. You set off for the ocean!',
      },
      {
        id: 'treasure_escape_ending',
        description: 'Leave with your treasure and seek new adventures',
        codeHint: 'If you have the treasure map and leave the kingdom, run choose_path("treasure_escape_ending").',
        requiredItem: 'treasure_map',
        message: "You slip away with the treasure map. The kingdom's riches await elsewhere!",
      },
      {
        id: 'abandon_kingdom',
        description: 'Leave the kingdom forever (without facing the dragon)',
        codeHint: 'If you abandon the kingdom, run choose_path("abandon_kingdom").',
        message: 'You turn your back on the castle and the dragon. The kingdom will have to find another hero.',
      },
    ],
  },
  beach_shore: {
    location: 'beach_shore',
    choices: [
      {
        id: 'explore_tide_pool',
        description: 'Explore the tide pools',
        codeHint: 'If you explore the tide pools, run choose_path("explore_tide_pool").',
        nextLocation: 'tide_pool',
      },
      {
        id: 'enter_cave',
        description: 'Enter the mysterious cave',
        codeHint: 'If you enter the cave, run choose_path("enter_cave").',
        nextLocation: 'cave_entrance',
      },
      {
        id: 'search_treasure',
        description: 'Search for treasure along the shore',
        codeHint: 'If you search for treasure, run choose_path("search_treasure").',
        nextLocation: 'treasure_cove',
      },
      {
        id: 'dive_deep',
        description: 'Dive into the deep ocean (WARNING: Requires pearl!)',
        codeHint: 'Only if you have the pearl, run choose_path("dive_deep"). Otherwise you will not survive.',
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
        codeHint: 'If you return to the shore, run choose_path("continue_shore").',
        nextLocation: 'beach_shore',
      },
      {
        id: 'explore_cave',
        description: 'Follow the path to the cave entrance',
        codeHint: 'If you go to the cave, run choose_path("explore_cave").',
        nextLocation: 'cave_entrance',
      },
      {
        id: 'search_pool',
        description: 'Search the tide pool for treasures',
        codeHint: 'If you search the pool, run choose_path("search_pool").',
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
        codeHint: 'If you have the treasure map and go to the mountains, run choose_path("path_mountain").',
        requiredItem: 'treasure_map',
        unlocksScene: 'mountain',
        nextScene: 'mountain',
        nextLocation: 'mountain_base',
        message: 'The treasure map reveals a path to the mountains!',
      },
      {
        id: 'path_desert',
        description: 'Take the ancient scroll to the desert (requires scroll)',
        codeHint: 'If you have the scroll and go to the desert, run choose_path("path_desert").',
        requiredItem: 'scroll',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
        message: 'The ancient scroll guides you to the desert!',
      },
      {
        id: 'stay_ocean',
        description: 'Continue exploring the ocean',
        codeHint: 'If you stay at the ocean, run choose_path("stay_ocean").',
        nextLocation: 'beach_shore',
      },
      {
        id: 'search_more',
        description: 'Search for more treasures',
        codeHint: 'If you search for more, run choose_path("search_more").',
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
        codeHint: 'If you have a rope and climb the cliff, run choose_path("climb_cliff").',
        requiredItem: 'rope',
        nextLocation: 'cliff_path',
        message: 'Your rope helps you safely climb the cliff!',
      },
      {
        id: 'explore_base',
        description: 'Explore the mountain base',
        codeHint: 'If you explore the base, run choose_path("explore_base").',
        nextLocation: 'mountain_base',
        message: 'You explore the base but don\'t find anything new. Try climbing the cliff path or looking for items to collect!',
      },
      {
        id: 'travel_to_town',
        description: 'Travel to the town to find a shield',
        codeHint: 'If you go to the town for a shield, run choose_path("travel_to_town").',
        nextScene: 'town',
        nextLocation: 'town_gate',
        message: 'You head down the mountain toward the town. Once there, use move_to("town_market") to find the shield!',
      },
      {
        id: 'return_previous',
        description: 'Return to previous area',
        codeHint: 'If you return to the previous area, run choose_path("return_previous").',
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
        codeHint: 'If you enter the crystal cave, run choose_path("enter_cave").',
        nextLocation: 'cave',
      },
      {
        id: 'enter_dark_cave',
        description: 'Enter the dark cave (WARNING: Requires torch!)',
        codeHint: 'Only if you have a torch, run choose_path("enter_dark_cave"). Otherwise it is deadly.',
        nextLocation: 'dark_cave',
        message: 'The dark cave looks ominous...',
      },
      {
        id: 'descend_cliff',
        description: 'Descend back to the cliff path',
        codeHint: 'If you descend, run choose_path("descend_cliff").',
        nextLocation: 'cliff_path',
      },
      {
        id: 'rest_summit',
        description: 'Rest at the summit and enjoy the view',
        codeHint: 'If you rest at the summit, run choose_path("rest_summit").',
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
        codeHint: 'If you have the crystal and go to the desert, run choose_path("path_desert").',
        requiredItem: 'crystal',
        unlocksScene: 'desert',
        nextScene: 'desert',
        nextLocation: 'oasis',
        message: 'The crystal glows and reveals a path to the desert!',
      },
      {
        id: 'return_summit',
        description: 'Return to the summit',
        codeHint: 'If you return to the summit, run choose_path("return_summit").',
        nextLocation: 'summit',
      },
      {
        id: 'return_base',
        description: 'Return to the mountain base',
        codeHint: 'If you return to the base, run choose_path("return_base").',
        nextLocation: 'mountain_base',
      },
      {
        id: 'explore_cave',
        description: 'Explore the cave deeper',
        codeHint: 'If you explore deeper, run choose_path("explore_cave").',
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
        codeHint: 'If you explore the dunes, run choose_path("explore_dunes").',
        nextLocation: 'sand_dunes',
      },
      {
        id: 'search_ruins',
        description: 'Search for ancient ruins',
        codeHint: 'If you search for ruins, run choose_path("search_ruins").',
        nextLocation: 'ancient_ruins',
      },
      {
        id: 'rest_oasis',
        description: 'Rest at the oasis',
        codeHint: 'If you rest at the oasis, run choose_path("rest_oasis").',
        nextLocation: 'oasis',
        message: 'The oasis provides much-needed rest and water.',
      },
      {
        id: 'find_temple',
        description: 'Look for the ancient temple',
        codeHint: 'If you look for the temple, run choose_path("find_temple").',
        nextLocation: 'temple',
      },
      {
        id: 'merchant_shortcut',
        description: 'Take the path the merchant described (only if you helped them)',
        codeHint: 'If you helped the merchant and take their shortcut, run choose_path("merchant_shortcut").',
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
        codeHint: 'If you continue to the ruins, run choose_path("continue_ruins").',
        nextLocation: 'ancient_ruins',
      },
      {
        id: 'return_oasis',
        description: 'Return to the oasis',
        codeHint: 'If you return to the oasis, run choose_path("return_oasis").',
        nextLocation: 'oasis',
      },
      {
        id: 'explore_dunes',
        description: 'Explore the sand dunes more',
        codeHint: 'If you explore the dunes more, run choose_path("explore_dunes").',
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
        codeHint: 'Only if you have the artifact, run choose_path("enter_temple"). Otherwise the curse will strike.',
        nextLocation: 'ancient_temple',
        message: 'The ancient temple radiates powerful energy...',
      },
      {
        id: 'visit_temple',
        description: 'Visit the regular temple',
        codeHint: 'If you visit the temple, run choose_path("visit_temple").',
        nextLocation: 'temple',
      },
      {
        id: 'return_oasis',
        description: 'Return to the oasis',
        codeHint: 'If you return to the oasis, run choose_path("return_oasis").',
        nextLocation: 'oasis',
      },
      {
        id: 'search_ruins',
        description: 'Search the ruins for artifacts',
        codeHint: 'If you search the ruins, run choose_path("search_ruins").',
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

// Chapter titles for book-like overlay (scene id -> chapter number and title)
export const CHAPTERS: Record<string, { number: number; title: string }> = {
  forest: { number: 1, title: 'The Mystical Forest' },
  castle: { number: 2, title: 'The Ancient Castle' },
  town: { number: 3, title: 'The Medieval Town' },
  ocean: { number: 4, title: 'The Mystical Ocean' },
  mountain: { number: 5, title: 'The Mountain Peak' },
  desert: { number: 6, title: 'The Ancient Desert' },
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
  left_kingdom: {
    id: 'left_kingdom',
    title: 'Left the Kingdom',
    message: 'You left the kingdom behind. The dragon was never faced, and the realm must find another hero.',
  },
  curse_of_temple: {
    id: 'curse_of_temple',
    title: 'Curse of the Temple',
    message: "The ancient temple's curse strikes you down. You should have brought an artifact to protect yourself.",
  },
  merchants_friend: {
    id: 'merchants_friend',
    title: "The Merchant's Friend",
    message: "You helped the merchant and claimed the ocean's treasure. You leave the kingdom as a friend to many—and rich in story.",
  },
};

// Book-like narrative for each location. String or object with default + optional flag-keyed variants.
export type LocationNarrativeEntry = string | { default: string; [flag: string]: string };

export const LOCATION_NARRATIVE: Record<string, LocationNarrativeEntry> = {
  forest_entrance: 'Tall trees loom on either side of the path. The air is cool and still. Somewhere in this forest lies a key—and a door that needs opening. Use move_to() to explore the path or the clearing.',
  forest_path: 'The path winds deeper into the woods. Birds call from the canopy; something glints between the ferns ahead. You can press on to the clearing or search here. A map is said to lie along this way.',
  forest_clearing: 'Sun breaks through the leaves into a peaceful clearing. A good place to rest—or to press on toward the forest exit where the paths to castle, town, and mountains await. Your choice will shape the journey.',
  forest_exit: 'The trees thin. Before you: the path to the ancient castle, the road to the medieval town, or the winding way to the mountains—if you have a map. Each path leads to a different fate.',
  castle_gate: 'The ancient castle rises before you, stone worn by years. The gate stands open. Inside, a courtyard and the promise of danger—or glory. The dragon\'s lair lies within for those who dare.',
  castle_courtyard: 'Stone walls enclose the courtyard. Ivy climbs the walls; somewhere above, a tower where a crown is kept. To one side, the great hall. To the other, the way out—or the path to the dragon\'s lair. Choose with care.',
  castle_hall: 'Torchlight flickers in the hall. Tapestries tell of kings and dragons. Stairs lead to the tower where the crown waits; the courtyard lies behind you. From the tower, those with the crown may find the way to the ocean.',
  castle_tower: {
    default: 'From the tower window you see the whole kingdom. A telescope points to distant shores. Here, among maps and old books, a crown waits. With it, the path to the mystical ocean may open.',
    found_crown: 'You have already taken the crown. From here you may seek the ocean with choose_path("explore_ocean") or leave for the town. The kingdom spreads below like a story waiting to end.',
  },
  dragon_lair: {
    default: 'The lair is hot and reeks of smoke. The dragon watches. With sword and shield you might survive; with the crown and a hypnotized beast, you might end this threat for good—or choose peace.',
    hypnotized_dragon: 'The dragon\'s eyes are glazed; the hypnosis holds. Now you may fight with sword and shield, or choose peace with choose_path("peaceful_ending"). The fate of the kingdom rests on your code.',
  },
  town_gate: 'The town gate bustles with travelers. Beyond it: the square, the market, and the chance to gather bread, shield, and coin. Rest and trade before you face the castle or the roads beyond.',
  town_square: 'The heart of the town. Merchants call out; the market is nearby where you may find a shield or help a merchant in need. Rest here, or seek the gate to the castle, forest, or ocean.',
  town_market: 'Stalls overflow with bread, potions, and gear. A merchant catches your eye—helping them with bread may earn you a map to the ocean. The shield here could save your life in the dragon\'s lair.',
  town_exit: 'The edge of town. From here you can return to the castle, take the path back to the forest, or follow a map to the ocean if you earned one. Some leave with treasure and never look back.',
  beach_shore: {
    default: 'Waves roll onto the sand. Tide pools and a cave entrance dot the shore. Somewhere, treasure and deeper waters call. Only with a pearl should you dare the deep trench.',
    helped_merchant: "The merchant's map led you true. The ocean stretches before you—tide pools, a cave, and the promise of treasure. You earned this path by helping another.",
  },
  tide_pool: 'Shells and shallow water. You could search here, head for the cave where a pearl might lie, or return to the main shore. The treasure cove awaits those who explore.',
  cave_entrance: 'The cave mouth is dark. Deeper in, something glows—perhaps a pearl. You will need light or magic to go farther. From the shore, move_to("treasure_cove") when you are ready to seek maps and scrolls.',
  treasure_cove: 'Hidden among the rocks, the cove holds more than shells. The treasure map points to the mountains; the ancient scroll to the desert. Choose your next journey with choose_path() when you have the right item.',
  deep_trench: 'The water presses in. Only a pearl\'s magic could see you through—and perhaps to what lies in the depths. Without it, this place is death.',
  mountain_base: 'The mountain rises ahead. A sword is said to rest here for the worthy. The cliff path and the summit wait above. You will need rope to climb safely and a torch for the dark cave.',
  cliff_path: 'The path is steep. A rope would make the climb safe. Above: the summit and a torch that could light the way. Without a torch, the dark cave on the summit is certain death.',
  summit: 'You have reached the summit. The world spreads below. A cave holds a crystal that may reveal the desert path; a darker cave demands a torch—without one, do not enter.',
  cave: 'Crystals gleam in the walls. One might show the path to the desert; collect it and use choose_path("path_desert"). The summit and the base are still within reach.',
  dark_cave: 'Darkness swallows the way. Without a torch, this place is death. With one, who knows what you might find. Only if you have the torch should you have come here.',
  oasis: {
    default: 'Palms and water in the endless sand. Travelers rest here before the dunes and the ancient ruins. If you helped the merchant in town, you may know a shortcut through the dunes.',
    helped_merchant: 'Palms and water in the endless sand. You remember the merchant\'s directions—a shortcut through the dunes may be yours with choose_path("merchant_shortcut").',
  },
  sand_dunes: 'Dunes roll to the horizon. Water is life here. The ruins—and the temple—lie ahead for those who prepare. An artifact from the ruins will protect you in the ancient temple.',
  ancient_ruins: 'Broken stones and old magic. An artifact here might protect you in the temple. The oasis is behind; the temples ahead. Do not enter the ancient temple without the artifact—the curse is real.',
  temple: 'A place of scrolls and quiet power. The magic gem waits for those who come prepared. The ancient temple is another step—but enter it only with an artifact or the curse will strike.',
  ancient_temple: {
    default: 'The heart of the desert\'s mystery. Only the protected may enter. The gem within could change the fate of the kingdom.',
    entered_temple: 'You have braved the temple with the artifact. The gem\'s power could bring peace to the dragon—or doom to those who misuse it.',
  },
};

const DEFAULT_NARRATIVE = 'You take in your surroundings. The next step is yours.';

// Priority order for picking narrative variant when multiple flags match.
const NARRATIVE_FLAG_PRIORITY = ['hypnotized_dragon', 'found_crown', 'entered_temple', 'helped_merchant'];

/** Code quiz at forest_exit: one question, multiple choice. Show once per player (flag: quiz_done_forest_exit). */
export const QUIZ_FOREST_EXIT = {
  locationId: 'forest_exit',
  flagWhenDone: 'quiz_done_forest_exit',
  title: 'A guardian of the path asks...',
  question: 'What function do you use to pick up an item?',
  options: ['move_to("item")', 'collect_item("item_name")', 'choose_path("item")', 'get_item("item")'],
  correctIndex: 1,
  successMessage: 'Correct! The guardian lets you pass.',
  wrongMessage: 'Not quite. Try again!',
};

/** Block minigame at dragon_lair: click Block when indicator is in green zone. Flag: dragon_block_won. */
export const BLOCK_MINIGAME_DRAGON = {
  locationId: 'dragon_lair',
  flagWhenDone: 'dragon_block_won',
  title: 'The dragon is about to breathe fire!',
  instruction: 'Click Block when the bar is in the green zone!',
  roundsRequired: 3,
  greenZoneStart: 0.35,
  greenZoneEnd: 0.65,
  indicatorSpeed: 0.015,
};

/** Modal content when player collects key story items (e.g. map at forest path). */
export const ITEM_STORY_MODALS: Record<string, { title: string; message: string }> = {
  map: {
    title: 'You found a Map!',
    message: 'The old map shows hidden paths through the kingdom. When you reach the forest exit, you can use it to take the path to the mountains. For now, keep exploring—find the key in the forest, then make your way to the clearing and beyond!',
  },
};

/** Returns narrative for a location; uses first matching flag variant, else default. */
export function getNarrative(location: string, storyFlags?: string[]): string {
  const entry = LOCATION_NARRATIVE[location];
  if (!entry) return DEFAULT_NARRATIVE;
  if (typeof entry === 'string') return entry;
  const flags = storyFlags || [];
  for (const flag of NARRATIVE_FLAG_PRIORITY) {
    if (flags.includes(flag) && entry[flag]) return entry[flag];
  }
  return entry.default;
}
