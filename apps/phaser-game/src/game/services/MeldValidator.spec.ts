import { describe, it, expect } from 'vitest';
import { MeldValidator } from './MeldValidator';
import { Card } from '../models/Card';

describe('MeldValidator', () => {
  it('should correctly evaluate the max melded count and score for a winning hand', () => {
    const cards = [
      new Card('hearts', 2),
      new Card('hearts', 3),
      new Card('hearts', 4),
      new Card('spades', 5),
      new Card('spades', 6),
      new Card('spades', 7),
      new Card('diamonds', 10),
      new Card('clubs', 10),
      new Card('hearts', 10),
      new Card('spades', 12)
    ];

    const maxMeldedCount = MeldValidator.findMaxMeldedCount(cards);
    const score = MeldValidator.evaluateHand(cards);
    const groupingLength = MeldValidator.getBestMeldGrouping(cards).length;

    // Based on the original test_bot.ts output expectations
    // 3 melds: (hearts 2,3,4), (spades 5,6,7), (diamonds, clubs, hearts 10) + one leftover
    expect(maxMeldedCount).toBeGreaterThanOrEqual(9);
    expect(score).toBeTypeOf('number');
    expect(groupingLength).toBeGreaterThanOrEqual(1);
    
    // Simulate discarding a card to get a winning hand of 9 cards
    const winningHand = [...cards];
    winningHand.splice(9, 1); // Remove the 10th card (spades 12)
    const winMeldsCount = MeldValidator.findMaxMeldedCount(winningHand);
    
    // 9 cards should form exactly 3 melds of 3 cards each
    expect(winMeldsCount).toBe(9);
  });
});
