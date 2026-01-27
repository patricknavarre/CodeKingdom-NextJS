// Story scenes configuration - shared across story game API routes
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
      1: { cost: 10, text: 'Try using an if statement to check your inventory!' },
      2: { cost: 20, text: 'Use: if "key" in inventory: open_door()' },
      3: { cost: 30, text: 'Check if you have collected the key. If yes, use open_door() to proceed.' },
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
      1: { cost: 10, text: 'You need to collect items to progress!' },
      2: { cost: 20, text: 'Use collect_item("sword") when you find it.' },
      3: { cost: 30, text: 'Collect the sword first, then check your inventory before moving forward.' },
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
      1: { cost: 10, text: 'Explore different locations to find items!' },
      2: { cost: 20, text: 'Move to different locations using move_to("location_name").' },
      3: { cost: 30, text: 'Visit the market to find useful items. Use move_to("town_market") then collect items.' },
    },
  },
};
