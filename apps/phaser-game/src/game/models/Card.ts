export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'joker';

export class Card {
    constructor(
        public suit: Suit,
        public value: number // 1 (Ace) to 13 (King), or 0 for Joker
    ) {}

    // Map the suit and value to the exact string name defined in cards.json
    public getTextureName(): string {
        if (this.suit === 'joker') {
            // We alternate jokers, or just pick one. Let's return black_joker for simplicity,
            // or randomize it if needed. The atlas has 'black_joker' and 'red_joker'.
            // I'll just map it directly.
            return Math.random() > 0.5 ? 'black_joker' : 'red_joker';
        }

        // The atlas names them like "clubs10", "hearts1" (Ace), "spades13" (King)
        return `${this.suit}${this.value}`;
    }
}
