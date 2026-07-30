import { Card } from '../models/Card';
import { MeldValidator } from './MeldValidator';

export class BotDecisionEngine {
    
    /**
     * Determines whether the bot should take the top discard card or draw from the deck.
     * 
     * Strategy: Simulate the full draw+discard cycle.
     * "If I take this card, what's the best 9-card hand I can form after discarding my worst?"
     * Compare that against my current 9-card hand score.
     * 
     * @param hand The bot's current 9 cards
     * @param topDiscard The card on top of the discard pile
     * @returns true if the bot should take the discard, false to draw from deck
     */
    public static shouldTakeDiscard(hand: Card[], topDiscard: Card): boolean {
        const currentScore = MeldValidator.evaluateHand(hand);

        // Simulate: take the discard, then find the best card to drop
        const potentialHand = [...hand, topDiscard];
        const bestDiscardIndex = this.chooseDiscard(potentialHand);
        const handAfterOptimalDiscard = [...potentialHand];
        handAfterOptimalDiscard.splice(bestDiscardIndex, 1);
        const scoreAfterTaking = MeldValidator.evaluateHand(handAfterOptimalDiscard);

        // Take the discard if the resulting 9-card hand is strictly better
        return scoreAfterTaking > currentScore;
    }

    /**
     * Evaluates all cards to find the one that, when removed, leaves the hand with the highest score.
     * @param hand The bot's current 10 cards (or any number)
     * @returns The index of the card to discard.
     */
    public static chooseDiscard(hand: Card[]): number {
        let maxScoreAfterDiscard = -1;
        const bestIndices: number[] = [];

        for (let i = 0; i < hand.length; i++) {
            const handWithoutCard = [...hand];
            handWithoutCard.splice(i, 1);
            const scoreAfter = MeldValidator.evaluateHand(handWithoutCard);
            
            if (scoreAfter > maxScoreAfterDiscard) {
                maxScoreAfterDiscard = scoreAfter;
                bestIndices.length = 0; // reset
                bestIndices.push(i);
            } else if (scoreAfter === maxScoreAfterDiscard) {
                bestIndices.push(i);
            }
        }

        // Randomly pick one among the best candidates so the bot isn't completely predictable
        return bestIndices[Math.floor(Math.random() * bestIndices.length)];
    }
}
