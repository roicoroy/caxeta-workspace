import { GameObjects } from 'phaser';
import { Card } from '../models/Card';
import { MeldValidator } from './MeldValidator';

export class BotService {
    private gameScene: any;

    constructor(scene: any) {
        this.gameScene = scene;
    }

    public async playTurn() {
        // Wait a bit to simulate "thinking"
        await this.delay(1000);

        // 1. Evaluate current hand for drawing phase
        const botCards = this.gameScene.botHand.getCards().map((c: GameObjects.Image) => c.getData('cardData') as Card);
        const currentScore = MeldValidator.evaluateHand(botCards);

        // Check top of discard pile
        const topDiscard = this.gameScene.getTopDiscardCardData();
        let tookFromDiscard = false;

        if (topDiscard) {
            const potentialHand = [...botCards, topDiscard];
            const potentialScore = MeldValidator.evaluateHand(potentialHand);

            // If taking the discard card improves our score significantly, we take it!
            if (potentialScore > currentScore) {
                this.gameScene.drawFromDiscardForBot();
                tookFromDiscard = true;
            }
        }

        if (!tookFromDiscard) {
            this.gameScene.drawCardForBot();
        }
        
        await this.delay(1000);

        // 2. Evaluate hand for winning / discarding
        const newBotCardSprites = this.gameScene.botHand.getCards();
        const newBotCards = newBotCardSprites.map((c: GameObjects.Image) => c.getData('cardData') as Card);
        
        // Check for 10-card win (PIFE)
        if (MeldValidator.findMaxMeldedCount(newBotCards) === 10) {
            this.gameScene.triggerBotWin(true);
            return;
        }

        // Find best card to discard that leaves the maximum score
        let maxScoreAfterDiscard = -1;
        const bestIndices = [];

        for (let i = 0; i < newBotCards.length; i++) {
            const handWithoutCard = [...newBotCards];
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

        // Check if the best remaining hand forms a 9-card winning hand
        const winningHand = [...newBotCards];
        winningHand.splice(bestIndices[0], 1); // simulate dropping best card
        if (MeldValidator.findMaxMeldedCount(winningHand) >= 9) {
            const bestDiscardIndex = bestIndices[0];
            const cardToDiscard = newBotCardSprites[bestDiscardIndex];
            this.gameScene.discardBotCardForWin(cardToDiscard);
            this.gameScene.triggerBotWin(false);
            return; // Game over
        }

        const bestDiscardIndex = bestIndices[Math.floor(Math.random() * bestIndices.length)];
        const cardToDiscard = newBotCardSprites[bestDiscardIndex];
        
        this.gameScene.discardBotCard(cardToDiscard);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
