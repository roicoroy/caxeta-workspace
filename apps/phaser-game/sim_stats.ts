import { Card, Suit } from './src/game/models/Card';
import { MeldValidator } from './src/game/services/MeldValidator';
import { BotDecisionEngine } from './src/game/services/BotDecisionEngine';

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

const NUM_GAMES = 5000;
let p1Wins = 0, p2Wins = 0, draws = 0;
let p1Pifes = 0, p2Pifes = 0;
const winTurns: number[] = [];
const p1WinTurns: number[] = [];
const p2WinTurns: number[] = [];

for (let g = 0; g < NUM_GAMES; g++) {
    const deck = createDeck();
    const p1Hand = deck.splice(0, 9); // player 1 goes first
    const p2Hand = deck.splice(0, 9);
    const discardPile: Card[] = [];
    let turn: 1 | 2 = 1;
    let turnCount = 0;
    let gameOver = false;

    while (!gameOver && deck.length > 0 && turnCount < 200) {
        turnCount++;
        const hand = turn === 1 ? p1Hand : p2Hand;

        // DRAW
        const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
        let tookFromDiscard = false;
        if (topDiscard && BotDecisionEngine.shouldTakeDiscard(hand, topDiscard)) {
            hand.push(discardPile.pop()!);
            tookFromDiscard = true;
        }
        if (!tookFromDiscard) {
            if (deck.length === 0) break;
            hand.push(deck.splice(0, 1)[0]);
        }

        // CHECK PIFE (10-card win)
        if (MeldValidator.findMaxMeldedCount(hand) === 10) {
            if (turn === 1) { p1Wins++; p1Pifes++; p1WinTurns.push(turnCount); }
            else { p2Wins++; p2Pifes++; p2WinTurns.push(turnCount); }
            winTurns.push(turnCount);
            gameOver = true;
            break;
        }

        // DISCARD
        const discardIndex = BotDecisionEngine.chooseDiscard(hand);
        const handAfterDiscard = [...hand];
        handAfterDiscard.splice(discardIndex, 1);

        if (MeldValidator.findMaxMeldedCount(handAfterDiscard) >= 9) {
            discardPile.push(hand.splice(discardIndex, 1)[0]);
            if (turn === 1) { p1Wins++; p1WinTurns.push(turnCount); }
            else { p2Wins++; p2WinTurns.push(turnCount); }
            winTurns.push(turnCount);
            gameOver = true;
            break;
        }

        discardPile.push(hand.splice(discardIndex, 1)[0]);
        turn = turn === 1 ? 2 : 1;
    }

    if (!gameOver) draws++;
}

const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Distribution buckets
const buckets = [5, 10, 15, 20, 25, 30, 40, 50, 100];
const dist: Record<string, number> = {};
for (const t of winTurns) {
    for (const b of buckets) {
        if (t <= b) { dist[`≤${b}`] = (dist[`≤${b}`] || 0) + 1; break; }
    }
}

console.log(`=== CAXETA 2-PLAYER STATISTICS (${NUM_GAMES} games) ===\n`);
console.log(`Player 1 wins: ${p1Wins} (${(p1Wins/NUM_GAMES*100).toFixed(1)}%) — goes first`);
console.log(`Player 2 wins: ${p2Wins} (${(p2Wins/NUM_GAMES*100).toFixed(1)}%)`);
console.log(`Draws (deck exhausted): ${draws} (${(draws/NUM_GAMES*100).toFixed(1)}%)\n`);

console.log(`--- Turn Statistics (winner's perspective) ---`);
console.log(`Average turns to win: ${avg(winTurns).toFixed(1)}`);
console.log(`Median turns to win: ${median(winTurns)}`);
console.log(`Fastest win: ${Math.min(...winTurns)} turns`);
console.log(`Slowest win: ${Math.max(...winTurns)} turns`);
console.log(`P1 avg turns: ${avg(p1WinTurns).toFixed(1)} | P2 avg turns: ${avg(p2WinTurns).toFixed(1)}\n`);

console.log(`--- Win Type ---`);
console.log(`Pife wins (10 cards): ${p1Pifes + p2Pifes} (${((p1Pifes+p2Pifes)/NUM_GAMES*100).toFixed(1)}%)`);
console.log(`Bateu wins (9 cards): ${p1Wins+p2Wins-p1Pifes-p2Pifes} (${((p1Wins+p2Wins-p1Pifes-p2Pifes)/NUM_GAMES*100).toFixed(1)}%)\n`);

console.log(`--- Turn Distribution ---`);
for (const b of buckets) {
    const count = dist[`≤${b}`] || 0;
    const pct = (count / winTurns.length * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / winTurns.length * 40));
    console.log(`  ≤${String(b).padStart(3)} turns: ${String(count).padStart(5)} (${pct.padStart(5)}%) ${bar}`);
}
