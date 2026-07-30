import { describe, it, expect } from 'vitest';
import { MeldValidator } from './MeldValidator';
import { Card } from '../models/Card';

describe('MeldValidator', () => {
  describe('isValidMeld', () => {
    describe('Trinca (Set)', () => {
      it('should validate 3 same-value cards with 3 different suits', () => {
        const cards = [new Card('hearts', 9), new Card('spades', 9), new Card('clubs', 9)];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should reject 3 same-value cards with only 2 unique suits (2-deck duplicate)', () => {
        const cards = [new Card('hearts', 9), new Card('hearts', 9), new Card('clubs', 9)];
        expect(MeldValidator.isValidMeld(cards)).toBe(false);
      });

      it('should validate 4-card Trinca with a duplicate suit but 3 unique suits overall', () => {
        const cards = [
          new Card('hearts', 9), new Card('hearts', 9),
          new Card('spades', 9), new Card('clubs', 9)
        ];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should reject fewer than 3 cards', () => {
        const cards = [new Card('hearts', 9), new Card('spades', 9)];
        expect(MeldValidator.isValidMeld(cards)).toBe(false);
      });
    });

    describe('Sequência (Run)', () => {
      it('should validate 3 consecutive same-suit cards', () => {
        const cards = [new Card('hearts', 5), new Card('hearts', 6), new Card('hearts', 7)];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should validate 4 consecutive same-suit cards', () => {
        const cards = [
          new Card('hearts', 7), new Card('hearts', 8),
          new Card('hearts', 9), new Card('hearts', 10)
        ];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should reject duplicate-value same-suit (from 2nd deck)', () => {
        const cards = [new Card('hearts', 5), new Card('hearts', 5), new Card('hearts', 6)];
        expect(MeldValidator.isValidMeld(cards)).toBe(false);
      });

      it('should validate Q-K-A (Ace high)', () => {
        const cards = [new Card('spades', 12), new Card('spades', 13), new Card('spades', 1)];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should validate A-2-3 (Ace low)', () => {
        const cards = [new Card('spades', 1), new Card('spades', 2), new Card('spades', 3)];
        expect(MeldValidator.isValidMeld(cards)).toBe(true);
      });

      it('should reject K-A-2 wrap-around (not valid per Caxeta rules)', () => {
        const cards = [new Card('spades', 13), new Card('spades', 1), new Card('spades', 2)];
        expect(MeldValidator.isValidMeld(cards)).toBe(false);
      });
    });
  });

  describe('findMaxMeldedCount', () => {
    it('should find 9 melded cards in a perfect winning hand', () => {
      const cards = [
        new Card('hearts', 2), new Card('hearts', 3), new Card('hearts', 4),
        new Card('spades', 5), new Card('spades', 6), new Card('spades', 7),
        new Card('diamonds', 10), new Card('clubs', 10), new Card('hearts', 10)
      ];
      expect(MeldValidator.findMaxMeldedCount(cards)).toBe(9);
    });

    it('should find 9 melded cards in a 10-card hand with one leftover', () => {
      const cards = [
        new Card('hearts', 2), new Card('hearts', 3), new Card('hearts', 4),
        new Card('spades', 5), new Card('spades', 6), new Card('spades', 7),
        new Card('diamonds', 10), new Card('clubs', 10), new Card('hearts', 10),
        new Card('spades', 12) // leftover
      ];
      expect(MeldValidator.findMaxMeldedCount(cards)).toBeGreaterThanOrEqual(9);
    });

    it('should handle duplicate cards from 2-deck game correctly', () => {
      const cards = [
        new Card('hearts', 5), new Card('hearts', 5), // duplicates
        new Card('hearts', 6), new Card('hearts', 7),
        new Card('spades', 9), new Card('clubs', 9), new Card('diamonds', 9),
        new Card('spades', 11), new Card('spades', 12)
      ];
      // 5♥,6♥,7♥ sequence + 9♠,9♣,9♦ Trinca = 6 melded
      expect(MeldValidator.findMaxMeldedCount(cards)).toBe(6);
    });
  });

  describe('evaluateHand', () => {
    it('should score a perfect 9-card hand at 900 (9 cards × 100 pts)', () => {
      const cards = [
        new Card('hearts', 5), new Card('hearts', 6), new Card('hearts', 7),
        new Card('spades', 9), new Card('clubs', 9), new Card('diamonds', 9),
        new Card('spades', 11), new Card('spades', 12), new Card('spades', 13)
      ];
      expect(MeldValidator.evaluateHand(cards)).toBe(900);
    });

    it('should penalize a hand with no melds and no partials (all deadwood)', () => {
      const cards = [
        new Card('hearts', 2), new Card('clubs', 7), new Card('diamonds', 11),
        new Card('spades', 4), new Card('hearts', 10), new Card('clubs', 1),
        new Card('diamonds', 6), new Card('spades', 8), new Card('hearts', 13)
      ];
      // All isolated cards should get a negative deadwood penalty
      expect(MeldValidator.evaluateHand(cards)).toBeLessThan(0);
    });

    it('should give partial credit for different-suit pairs (toward Trinca)', () => {
      const handWithPair = [
        new Card('hearts', 5), new Card('clubs', 5), // pair, different suits
        new Card('diamonds', 11), new Card('spades', 4), new Card('hearts', 10),
        new Card('clubs', 1), new Card('diamonds', 6), new Card('spades', 8),
        new Card('hearts', 13)
      ];
      const handWithoutPair = [
        new Card('hearts', 5), new Card('clubs', 7), // no pair
        new Card('diamonds', 11), new Card('spades', 4), new Card('hearts', 10),
        new Card('clubs', 1), new Card('diamonds', 6), new Card('spades', 8),
        new Card('hearts', 13)
      ];
      expect(MeldValidator.evaluateHand(handWithPair)).toBeGreaterThan(
        MeldValidator.evaluateHand(handWithoutPair)
      );
    });

    it('should not give partial credit for same-suit duplicates (dead weight in 2-deck)', () => {
      const handWithDupe = [
        new Card('hearts', 5), new Card('hearts', 5), // same suit duplicate
        new Card('diamonds', 11), new Card('spades', 4), new Card('clubs', 10),
        new Card('clubs', 1), new Card('diamonds', 6), new Card('spades', 8),
        new Card('hearts', 13)
      ];
      const handWithRandom = [
        new Card('hearts', 5), new Card('clubs', 7), // unrelated card
        new Card('diamonds', 11), new Card('spades', 4), new Card('clubs', 10),
        new Card('clubs', 1), new Card('diamonds', 6), new Card('spades', 8),
        new Card('hearts', 13)
      ];
      // Same-suit duplicates should not score higher than a random unrelated card
      expect(MeldValidator.evaluateHand(handWithDupe)).toBeLessThanOrEqual(
        MeldValidator.evaluateHand(handWithRandom)
      );
    });
  });

  describe('getBestMeldGrouping', () => {
    it('should group melded cards first, then remaining cards', () => {
      const cards = [
        new Card('hearts', 2), new Card('hearts', 3), new Card('hearts', 4),
        new Card('spades', 5), new Card('spades', 6), new Card('spades', 7),
        new Card('diamonds', 10), new Card('clubs', 10), new Card('hearts', 10),
        new Card('spades', 12)
      ];

      const grouped = MeldValidator.getBestMeldGrouping(cards);
      expect(grouped).toHaveLength(10);

      // The last card should be the leftover (spades 12)
      const lastCard = grouped[grouped.length - 1];
      expect(lastCard.suit).toBe('spades');
      expect(lastCard.value).toBe(12);
    });
  });
});
