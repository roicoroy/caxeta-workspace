import { GameUI } from '../models/GameUI';
import { BotService } from '../services/BotService';
import { PlayerHand } from '../models/PlayerHand';
import { BotHand } from '../models/BotHand';
import { Card } from '../models/Card';
import { MeldValidator } from '../services/MeldValidator';
import { Scene } from 'phaser';

export class GameController {
    public currentTurn: 'player' | 'bot' = 'player';
    
    constructor(
        private scene: Scene,
        private gameUI: GameUI, 
        private botService: BotService,
        private playerHand: PlayerHand,
        private botHand: BotHand
    ) {}

    public startTurn(turn: 'player' | 'bot') {
        this.currentTurn = turn;
        if (turn === 'player') {
            this.gameUI.showMessage('Your Turn!\nDraw a card, then discard.', '#00ff00');
        } else {
            this.gameUI.showMessage('Opponent\'s Turn...', '#ffaaaa');
            this.botService.playTurn();
        }
    }

    public handleBateuAttempt() {
        const cards = this.playerHand.getCards().map(c => c.getData('cardData') as Card);
        const inMeld = MeldValidator.identifyMelds(cards);

        const isAllMelded = inMeld.every(status => status === true);
        const totalCards = cards.length;

        if (isAllMelded && totalCards >= 9) {
            if (totalCards === 10) {
                this.gameUI.showMessage('PIFE!\nYou won with 10 cards!\n(-2 Pts for opponents)', '#00ff00');
            } else {
                this.gameUI.showMessage('BATEU!\nYou won with 9 cards!\n(-1 Pt for opponents)', '#00ff00');
            }
            // Lock hand
            this.playerHand.getCards().forEach(c => this.scene.input.setDraggable(c, false));
        } else {
            this.gameUI.showMessage('Invalid Hand!\nNot all cards are in valid sets.', '#ff0000');
            this.scene.time.delayedCall(2000, () => {
                this.gameUI.showMessage('Cachetão\nDraw a card, then discard a card!\nDrag cards within your hand to sort them.', '#ffffff');
            });
        }
    }

    public triggerBotWin(isPife = false) {
        if (isPife) {
            this.gameUI.showMessage('BOT PIFE!\nYou lost!\n(-2 Pts for you)', '#ff0000');
        } else {
            this.gameUI.showMessage('BOT BATEU!\nYou lost!\n(-1 Pt for you)', '#ff0000');
        }

        try {
            const botCards = this.botHand.getCards();
            const cardDataList = botCards.map(c => c.getData('cardData') as Card);
            const orderedCardData = MeldValidator.getBestMeldGrouping(cardDataList);

            botCards.sort((a, b) => {
                const dataA = a.getData('cardData');
                const dataB = b.getData('cardData');
                if (!dataA || !dataB) return 0;
                const indexA = orderedCardData.indexOf(dataA as Card);
                const indexB = orderedCardData.indexOf(dataB as Card);
                return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99);
            });

            botCards.forEach(c => {
                const cd = c.getData('cardData');
                if (cd) c.setTexture('cards', (cd as Card).getTextureName());
            });

            this.botHand.rearrange();
        } catch (e) {
            console.error("Error during bot win grouping:", e);
            this.botHand.getCards().forEach(c => {
                const cd = c.getData('cardData');
                if (cd) c.setTexture('cards', (cd as Card).getTextureName());
            });
            this.botHand.rearrange();
        }
    }
}
