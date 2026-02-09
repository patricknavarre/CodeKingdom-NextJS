import type { DecisionChoice } from '@/lib/storyGameConstants';

export type StoryGameForChoice = {
  inventory: Array<{ name: string }>;
  choices: Array<{ scene: string; location: string; choice: string }>;
  storyFlags?: string[];
};

/**
 * Returns true if this choice should be available given current story state
 * (inventory, past choices, story flags).
 */
export function isChoiceAvailable(
  choice: DecisionChoice,
  storyGame: StoryGameForChoice
): boolean {
  if (choice.requiredItem) {
    const hasItem = storyGame.inventory.some((item) => item.name === choice.requiredItem);
    if (!hasItem) return false;
  }
  if (choice.requiredFlag) {
    const flags = storyGame.storyFlags || [];
    if (!flags.includes(choice.requiredFlag)) return false;
  }
  if (choice.requiredChoice) {
    const made = (storyGame.choices || []).some(
      (c) =>
        c.location === choice.requiredChoice!.location &&
        c.choice === choice.requiredChoice!.choice
    );
    if (!made) return false;
  }
  return true;
}
