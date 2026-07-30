import { Card, Suit } from './Card';

export class Deck {
    private cards: Card[] = [];

    constructor(numDecks = 2) {
        this.initialize(numDecks);
    }

    private initialize(numDecks: number) {
        const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

        for (let d = 0; d < numDecks; d++) {
            for (const suit of suits) {
                for (let value = 1; value <= 13; value++) {
                    this.cards.push(new Card(suit, value));
                }
            }
        }
    }

    public shuffle() {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public draw(amount: number): Card[] {
        return this.cards.splice(0, amount);
    }

    public getRemainingCount(): number {
        return this.cards.length;
    }

    public recycle(discardedCards: Card[]) {
        this.cards.push(...discardedCards);
        this.shuffle();
    }
}
