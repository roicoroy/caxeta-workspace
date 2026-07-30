import { MeldValidator } from './src/game/services/MeldValidator';
import { Card } from './src/game/models/Card';

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

console.log('Max melds:', MeldValidator.findMaxMeldedCount(cards));
console.log('Score:', MeldValidator.evaluateHand(cards));
console.log('Grouping:', MeldValidator.getBestMeldGrouping(cards).length);

const winningHand = [...cards];
winningHand.splice(9, 1);
console.log('Win melds:', MeldValidator.findMaxMeldedCount(winningHand));

