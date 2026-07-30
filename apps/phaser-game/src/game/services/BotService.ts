import { GameObjects } from 'phaser';
import { Card } from '../models/Card';
import { MeldValidator } from './MeldValidator';
import { BotDecisionEngine } from './BotDecisionEngine';

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
        
        // Check top of discard pile
        const topDiscard = this.gameScene.getTopDiscardCardData();
        let tookFromDiscard = false;

        if (topDiscard) {
            if (BotDecisionEngine.shouldTakeDiscard(botCards, topDiscard)) {
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

        // Ask the Decision Engine what to discard
        const bestDiscardIndex = BotDecisionEngine.chooseDiscard(newBotCards);

        // Check if the remaining hand forms a 9-card winning hand
        const winningHand = [...newBotCards];
        winningHand.splice(bestDiscardIndex, 1);
        if (MeldValidator.findMaxMeldedCount(winningHand) >= 9) {
            const cardToDiscard = newBotCardSprites[bestDiscardIndex];
            this.gameScene.discardBotCardForWin(cardToDiscard);
            this.gameScene.triggerBotWin(false);
            return; // Game over
        }

        const cardToDiscard = newBotCardSprites[bestDiscardIndex];
        this.gameScene.discardBotCard(cardToDiscard);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
