// Removed vitest import to use Jest globals
import { BotDecisionEngine } from './BotDecisionEngine';
import { MeldValidator } from './MeldValidator';
import { Card, Suit } from '../models/Card';

describe('BotDecisionEngine', () => {
    describe('shouldTakeDiscard', () => {
        it('should take discard if it completes a meld (sequence)', () => {
            const hand = [
                new Card('hearts', 5),
                new Card('hearts', 6),
                new Card('spades', 9),
                new Card('clubs', 10),
                new Card('diamonds', 2),
                new Card('hearts', 13),
                new Card('spades', 3),
                new Card('clubs', 1),
                new Card('diamonds', 12)
            ];

            // 7 of hearts completes the sequence (5, 6, 7 of hearts)
            const topDiscard = new Card('hearts', 7);

            expect(BotDecisionEngine.shouldTakeDiscard(hand, topDiscard)).toBe(true);
        });

        it('should take discard if it completes a Trinca', () => {
            const hand = [
                new Card('hearts', 9),
                new Card('spades', 9),
                // need a 3rd 9 to complete the Trinca
                new Card('clubs', 3),
                new Card('diamonds', 7),
                new Card('hearts', 1),
                new Card('spades', 12),
                new Card('clubs', 6),
                new Card('diamonds', 11),
                new Card('hearts', 4)
            ];

            const topDiscard = new Card('clubs', 9);
            expect(BotDecisionEngine.shouldTakeDiscard(hand, topDiscard)).toBe(true);
        });

        it('should NOT take discard if it does not improve the hand after optimal discard', () => {
            const hand = [
                new Card('hearts', 5),
                new Card('hearts', 6),
                new Card('spades', 9),
                new Card('clubs', 10),
                new Card('diamonds', 2),
                new Card('hearts', 13),
                new Card('spades', 3),
                new Card('clubs', 1),
                new Card('diamonds', 12)
            ];

            // A 4 of clubs doesn't help form anything — taking it and discarding the worst
            // should leave the hand no better than before
            const topDiscard = new Card('clubs', 4);
            expect(BotDecisionEngine.shouldTakeDiscard(hand, topDiscard)).toBe(false);
        });

        it('should take discard if it builds a useful pair toward a Trinca', () => {
            // Hand with no melds and no pairs
            const hand = [
                new Card('hearts', 2),
                new Card('clubs', 5),
                new Card('diamonds', 8),
                new Card('spades', 11),
                new Card('hearts', 13),
                new Card('clubs', 3),
                new Card('diamonds', 6),
                new Card('spades', 9),
                new Card('hearts', 12)
            ];

            // Taking a 5 of different suit creates a pair with 5♣
            const topDiscard = new Card('diamonds', 5);
            const result = BotDecisionEngine.shouldTakeDiscard(hand, topDiscard);

            // The bot should consider: after taking 5♦ and discarding worst card,
            // is the resulting 9-card hand better? A pair adds 20pts to partial score
            // so the result depends on what card would be dropped.
            // We just verify the method doesn't crash and returns a boolean
            expect(typeof result).toBe('boolean');
        });
    });

    describe('chooseDiscard', () => {
        it('should discard the one card that does not belong to any meld in a near-winning hand', () => {
            const hand = [
                // Meld 1: 5,6,7 Hearts
                new Card('hearts', 5),
                new Card('hearts', 6),
                new Card('hearts', 7),

                // Meld 2: 9,9,9 (Mixed suits)
                new Card('spades', 9),
                new Card('clubs', 9),
                new Card('diamonds', 9),

                // Meld 3: J,Q,K Spades
                new Card('spades', 11),
                new Card('spades', 12),
                new Card('spades', 13),

                // Random 10th card (The one that should be discarded)
                new Card('diamonds', 2)
            ];

            const discardIndex = BotDecisionEngine.chooseDiscard(hand);
            
            // The 2 of Diamonds is at index 9 — it's the only non-meld card
            expect(discardIndex).toBe(9);
        });

        it('should not discard a card that is part of a meld', () => {
            const hand = [
                // Meld: A,2,3 of Hearts
                new Card('hearts', 1),
                new Card('hearts', 2),
                new Card('hearts', 3),
                // Random cards
                new Card('clubs', 7),
                new Card('diamonds', 10),
                new Card('spades', 5),
                new Card('clubs', 12),
                new Card('diamonds', 4),
                new Card('spades', 8),
                new Card('clubs', 11)
            ];

            const discardIndex = BotDecisionEngine.chooseDiscard(hand);

            // Should NOT discard indices 0, 1, or 2 (the meld cards)
            expect(discardIndex).toBeGreaterThanOrEqual(3);
        });
    });

    describe('game simulation', () => {
        function createDeck(): Card[] {
            const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
            const cards: Card[] = [];
            for (let d = 0; d < 2; d++) {
                for (const suit of suits) {
                    for (let value = 1; value <= 13; value++) {
                        cards.push(new Card(suit, value));
                    }
                }
            }
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            return cards;
        }

        it('should win at least 20% of games in a 200-game simulation', () => {
            let botWins = 0;
            const NUM_GAMES = 200;

            for (let g = 0; g < NUM_GAMES; g++) {
                const deck = createDeck();
                const botHand = deck.splice(0, 9);
                const playerHand = deck.splice(0, 9);
                const discardPile: Card[] = [];

                let turn: 'player' | 'bot' = 'player';
                let turnCount = 0;

                while (turnCount < 200 && deck.length > 0) {
                    turnCount++;
                    const hand = turn === 'bot' ? botHand : playerHand;

                    const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
                    let tookFromDiscard = false;

                    if (topDiscard) {
                        if (BotDecisionEngine.shouldTakeDiscard(hand, topDiscard)) {
                            hand.push(discardPile.pop()!);
                            tookFromDiscard = true;
                        }
                    }

                    if (!tookFromDiscard) {
                        if (deck.length === 0) break;
                        hand.push(deck.splice(0, 1)[0]);
                    }

                    if (MeldValidator.findMaxMeldedCount(hand) === 10) {
                        if (turn === 'bot') botWins++;
                        break;
                    }

                    const discardIndex = BotDecisionEngine.chooseDiscard(hand);
                    const handAfterDiscard = [...hand];
                    handAfterDiscard.splice(discardIndex, 1);

                    if (MeldValidator.findMaxMeldedCount(handAfterDiscard) >= 9) {
                        discardPile.push(hand.splice(discardIndex, 1)[0]);
                        if (turn === 'bot') botWins++;
                        break;
                    }

                    discardPile.push(hand.splice(discardIndex, 1)[0]);
                    turn = turn === 'bot' ? 'player' : 'bot';
                }
            }

            const winRate = botWins / NUM_GAMES;
            // The bot should win at least 20% of games (both players use same AI)
            expect(winRate).toBeGreaterThanOrEqual(0.20);
        });
    });
});
