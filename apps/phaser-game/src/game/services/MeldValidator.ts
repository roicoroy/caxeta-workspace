import { Card } from '../models/Card';

export class MeldValidator {

    /**
     * Identifies melds in a given list of cards and returns an array of indices that form valid melds.
     * Note: This does not account for all permutations of hand layout yet, it evaluates them 
     * sequentially as laid out visually. 
     */
    public static identifyMelds(cards: Card[]): boolean[] {
        const memo = new Map<number, boolean[]>();

        const findBest = (index: number): boolean[] => {
            if (index >= cards.length) return [];
            if (memo.has(index)) return memo.get(index)!;

            // Option 1: Skip this card
            let bestResult: boolean[] = [false, ...findBest(index + 1)];
            let bestCount = bestResult.filter(Boolean).length;

            // Option 2: Try 4-card meld
            if (index + 3 < cards.length) {
                const group = [cards[index], cards[index + 1], cards[index + 2], cards[index + 3]];
                if (this.isValidMeld(group)) {
                    const result = [true, true, true, true, ...findBest(index + 4)];
                    const count = result.filter(Boolean).length;
                    if (count > bestCount) {
                        bestCount = count;
                        bestResult = result;
                    }
                }
            }

            // Option 3: Try 3-card meld
            if (index + 2 < cards.length) {
                const group = [cards[index], cards[index + 1], cards[index + 2]];
                if (this.isValidMeld(group)) {
                    const result = [true, true, true, ...findBest(index + 3)];
                    const count = result.filter(Boolean).length;
                    if (count > bestCount) {
                        bestCount = count;
                        bestResult = result;
                    }
                }
            }

            memo.set(index, bestResult);
            return bestResult;
        };

        return findBest(0);
    }

    /**
     * Finds the maximum number of cards that can be melded, regardless of order.
     * Useful for the AI to evaluate a hand without relying on visual sorting.
     */
    public static findMaxMeldedCount(cards: Card[]): number {
        const validMelds: Card[][] = [];

        // Find all 3-card melds
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const group = [cards[i], cards[j], cards[k]];
                    if (this.isValidMeld(group)) validMelds.push(group);
                }
            }
        }

        // Find all 4-card melds
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    for (let l = k + 1; l < cards.length; l++) {
                        const group = [cards[i], cards[j], cards[k], cards[l]];
                        if (this.isValidMeld(group)) validMelds.push(group);
                    }
                }
            }
        }

        return this.getMaxNonOverlappingCards(validMelds, []);
    }

    private static getMaxNonOverlappingCards(melds: Card[][], currentUsedCards: Card[]): number {
        let maxCards = currentUsedCards.length;

        for (const meld of melds) {
            const overlaps = meld.some(c => currentUsedCards.includes(c));
            if (!overlaps) {
                const count = this.getMaxNonOverlappingCards(melds, [...currentUsedCards, ...meld]);
                if (count > maxCards) maxCards = count;
            }
        }

        return maxCards;
    }

    /**
     * Evaluates a hand and returns a score.
     * Full meld cards = 100 pts each.
     * Partial 2-card melds = 10 pts each.
     */
    public static evaluateHand(cards: Card[]): number {
        const validMelds: Card[][] = [];

        // 1. Find all 3-card and 4-card full melds
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const group = [cards[i], cards[j], cards[k]];
                    if (this.isValidMeld(group)) validMelds.push(group);
                    for (let l = k + 1; l < cards.length; l++) {
                        const group4 = [cards[i], cards[j], cards[k], cards[l]];
                        if (this.isValidMeld(group4)) validMelds.push(group4);
                    }
                }
            }
        }

        // Find the best combination of full melds
        let bestCombination: Card[] = [];
        let maxFullMeldCount = 0;

        const findBestCombo = (meldsLeft: Card[][], currentUsed: Card[]) => {
            if (currentUsed.length > maxFullMeldCount) {
                maxFullMeldCount = currentUsed.length;
                bestCombination = [...currentUsed];
            }
            for (let i = 0; i < meldsLeft.length; i++) {
                const meld = meldsLeft[i];
                if (!meld.some(c => currentUsed.includes(c))) {
                    findBestCombo(meldsLeft.slice(i + 1), [...currentUsed, ...meld]);
                }
            }
        };
        findBestCombo(validMelds, []);

        let score = maxFullMeldCount * 100;

        // 2. Look at remaining cards for pairs / partial sequences
        const remainingCards = cards.filter(c => !bestCombination.includes(c));
        let partialScore = 0;
        const counted = new Set<Card>();

        for (let i = 0; i < remainingCards.length; i++) {
            for (let j = i + 1; j < remainingCards.length; j++) {
                const c1 = remainingCards[i];
                const c2 = remainingCards[j];

                // Pair toward Trinca: same value, DIFFERENT suit (can become a 3-suit Trinca)
                if (c1.value === c2.value && c1.suit !== c2.suit) {
                    if (!counted.has(c1)) { partialScore += 40; counted.add(c1); }
                    if (!counted.has(c2)) { partialScore += 40; counted.add(c2); }
                }

                // Partial sequence: same suit, consecutive or gap-of-1
                if (c1.suit === c2.suit && c1.value !== c2.value) {
                    const diff = Math.abs(c1.value - c2.value);
                    const isAceKing = (c1.value === 1 && c2.value === 13) || (c1.value === 13 && c2.value === 1);

                    if (diff === 1 || isAceKing) {
                        // Consecutive: strong partial (one card away from a run)
                        if (!counted.has(c1)) { partialScore += 35; counted.add(c1); }
                        if (!counted.has(c2)) { partialScore += 35; counted.add(c2); }
                    } else if (diff === 2) {
                        // Gap of 1: weaker partial (needs a specific middle card)
                        if (!counted.has(c1)) { partialScore += 15; counted.add(c1); }
                        if (!counted.has(c2)) { partialScore += 15; counted.add(c2); }
                    }
                }

                // Same value, SAME suit (duplicate from 2nd deck): worth nothing for Trinca
                // Intentionally not scored — these are dead weight
            }
        }

        // 3. Penalize isolated cards (deadwood) — cards with no relation to any partial or meld
        for (const card of remainingCards) {
            if (!counted.has(card)) {
                partialScore -= 15; // deadwood penalty
            }
        }

        score += partialScore;
        return score;
    }

    /**
     * Returns an ordered array of cards where cards forming valid melds are grouped together,
     * followed by any remaining cards.
     */
    public static getBestMeldGrouping(cards: Card[]): Card[] {
        const validMelds: Card[][] = [];

        // 1. Find all 3-card and 4-card full melds
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const group = [cards[i], cards[j], cards[k]];
                    if (this.isValidMeld(group)) validMelds.push(group);
                    for (let l = k + 1; l < cards.length; l++) {
                        const group4 = [cards[i], cards[j], cards[k], cards[l]];
                        if (this.isValidMeld(group4)) validMelds.push(group4);
                    }
                }
            }
        }

        let bestCombination: Card[] = [];
        let maxFullMeldCount = 0;

        const findBestCombo = (meldsLeft: Card[][], currentUsed: Card[]) => {
            if (currentUsed.length > maxFullMeldCount) {
                maxFullMeldCount = currentUsed.length;
                bestCombination = [...currentUsed];
            }
            for (let i = 0; i < meldsLeft.length; i++) {
                const meld = meldsLeft[i];
                if (!meld.some(c => currentUsed.includes(c))) {
                    findBestCombo(meldsLeft.slice(i + 1), [...currentUsed, ...meld]);
                }
            }
        };
        findBestCombo(validMelds, []);

        const remainingCards = cards.filter(c => !bestCombination.includes(c));
        return [...bestCombination, ...remainingCards];
    }

    public static isValidMeld(cards: Card[]): boolean {
        if (cards.length < 3) return false;

        // Trinca (Set)
        const firstValue = cards[0].value;
        const isSameValue = cards.every(c => c.value === firstValue);
        if (isSameValue) {
            const uniqueSuits = new Set(cards.map(c => c.suit));
            // A valid Trinca MUST have at least 3 unique suits.
            if (uniqueSuits.size >= 3) {
                return true;
            }
        }

        // Sequência (Run)
        const firstSuit = cards[0].suit;
        const isSameSuit = cards.every(c => c.suit === firstSuit);
        if (isSameSuit) {
            const values = cards.map(c => c.value).sort((a, b) => a - b);

            // Check consecutive
            if (this.isConsecutive(values)) return true;

            // Check Q-K-A (if Ace is present, treat it as 14)
            if (values[0] === 1) {
                const highValues = [...values.slice(1), 14].sort((a, b) => a - b);
                if (this.isConsecutive(highValues)) return true;
            }
        }

        return false;
    }

    private static isConsecutive(values: number[]): boolean {
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] + 1 !== values[i + 1]) {
                return false;
            }
        }
        return true;
    }
}
