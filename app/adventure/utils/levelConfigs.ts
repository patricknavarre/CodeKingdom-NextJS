// Level configuration types and data for Code Grid Adventure

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  hint: string;
  grid: number[][]; // 0=empty, 1=wall, 2=diamond, 3=flag/goal
  diamondPositions: { x: number; y: number }[];
  startPosition: { x: number; y: number };
  startDirection: 'up' | 'down' | 'left' | 'right';
  minMoves?: number; // Optional challenge: minimum moves to complete
  maxMoves?: number; // Optional challenge: maximum moves allowed
}

export const LEVELS: LevelConfig[] = [
  // Level 1: Simple introduction
  {
    id: 1,
    title: 'First Steps',
    description: 'Learn the basics! Move to collect the diamond and reach the flag.',
    hint: 'Use "move" to walk forward and "turn" to change direction. Collect the diamond, then reach the flag!',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [{ x: 6, y: 1 }],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 2: Current level (slightly modified)
  {
    id: 2,
    title: 'Maze Runner',
    description: 'Navigate through the maze and collect all 3 diamonds!',
    hint: 'Plan your path! You need to collect all diamonds before reaching the flag.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 2, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 0, 1, 3, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 7, y: 1 },
      { x: 3, y: 3 },
      { x: 1, y: 7 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 3: More complex maze
  {
    id: 3,
    title: 'Diamond Collector',
    description: 'Collect all 3 diamonds in this winding maze!',
    hint: 'Watch out for dead ends! You might need to backtrack to collect all diamonds.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 10, y: 1 },
      { x: 1, y: 7 },
      { x: 10, y: 10 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 4: Spiral challenge
  {
    id: 4,
    title: 'Spiral Path',
    description: 'Navigate the spiral and collect all 4 diamonds!',
    hint: 'The path spirals inward. Plan your route to collect all diamonds efficiently.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 2, 2, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 1, y: 3 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 10, y: 9 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 5: Multiple paths
  {
    id: 5,
    title: 'Choose Your Path',
    description: 'Multiple routes lead to diamonds. Find the best path!',
    hint: 'There are multiple ways to collect all diamonds. Try to find the most efficient route!',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 2, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 0, 1, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 10, y: 1 },
      { x: 3, y: 3 },
      { x: 9, y: 5 },
      { x: 1, y: 10 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 6: Larger maze
  {
    id: 6,
    title: 'The Labyrinth',
    description: 'A complex maze with 5 diamonds to collect!',
    hint: 'This is a big maze! Take your time and plan your route carefully.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 12, y: 1 },
      { x: 1, y: 7 },
      { x: 12, y: 11 },
      { x: 5, y: 1 },
      { x: 7, y: 1 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 7: Tight spaces
  {
    id: 7,
    title: 'Narrow Passages',
    description: 'Navigate tight corridors and collect 4 diamonds!',
    hint: 'The passages are narrow! Be precise with your movements.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 2, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 10, y: 3 },
      { x: 1, y: 7 },
      { x: 10, y: 10 },
      { x: 5, y: 1 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  },

  // Level 8: Advanced maze
  {
    id: 8,
    title: 'Master Maze',
    description: 'The ultimate challenge! Collect all 6 diamonds!',
    hint: 'This is the hardest maze yet! Plan carefully and use your blocks efficiently.',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    diamondPositions: [
      { x: 14, y: 1 },
      { x: 3, y: 3 },
      { x: 1, y: 10 },
      { x: 14, y: 12 },
      { x: 5, y: 1 },
      { x: 7, y: 1 }
    ],
    startPosition: { x: 1, y: 1 },
    startDirection: 'right'
  }
];

// Helper function to get level config by ID
export function getLevelConfig(levelId: number): LevelConfig | undefined {
  return LEVELS.find(level => level.id === levelId);
}

// Helper function to get the maximum level
export function getMaxLevel(): number {
  return LEVELS.length;
}
