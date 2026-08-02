import { Scene, Math as PhaserMath, GameObjects } from 'phaser';
import { PlayerHand } from '../models/PlayerHand';
import { TableManager } from './TableManager';
import { GameController } from './GameController';
import { Deck } from '../models/Deck';
import { GameUI } from '../models/GameUI';
import { Card } from '../models/Card';

export class GameInputHandler {
    constructor(
        private scene: Scene,
        private playerHand: PlayerHand,
        private tableManager: TableManager,
        private gameController: GameController,
        private deck: Deck,
        private gameUI: GameUI
    ) {}

    public initialize() {
        this.setupDeckClicks();
        this.setupDragEvents();
    }

    private setupDeckClicks() {
        // Discard pile click
        this.tableManager.discardPile.on('pointerdown', () => {
            if (this.gameController.currentTurn !== 'player') return;
            if (this.playerHand.getTotalCardCount() < 10 && this.tableManager.hasDiscards()) {
                const topCardSprite = this.tableManager.popTopDiscard();
                if (topCardSprite) {
                    this.scene.children.bringToTop(topCardSprite);
                    topCardSprite.setInteractive({ cursor: 'pointer' });
                    this.scene.input.setDraggable(topCardSprite, true);

                    topCardSprite.setData('isNewDraw', true);
                    this.playerHand.setFloatingCard(topCardSprite);

                    const centerX = this.scene.scale.gameSize.width / 2;
                    const centerY = this.scene.scale.gameSize.height / 2;

                    this.scene.tweens.add({
                        targets: topCardSprite,
                        x: centerX,
                        y: centerY + (this.scene.scale.gameSize.height > this.scene.scale.gameSize.width ? -20 : 60),
                        scaleX: 1.0,
                        scaleY: 1.0,
                        angle: 0,
                        duration: 350,
                        ease: 'Back.easeOut'
                    });

                    this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
                }
            }
        });

        // Draw deck click
        this.tableManager.drawDeck.on('pointerdown', () => {
            if (this.gameController.currentTurn !== 'player') return;

            if (this.deck.getRemainingCount() === 0 && this.tableManager.hasDiscards()) {
                this.tableManager.recycleDiscards(this.deck);
                this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
                return;
            }

            if (this.playerHand.getTotalCardCount() < 10 && this.deck.getRemainingCount() > 0) {
                const drawnCards = this.deck.draw(1);
                const newCardData = drawnCards[0];

                const newCard = this.scene.add.image(this.tableManager.drawDeck.x, this.tableManager.drawDeck.y, 'cards', newCardData.getTextureName());
                newCard.setData('cardData', newCardData);
                newCard.setData('isNewDraw', true);
                this.playerHand.setFloatingCard(newCard);
                newCard.setScale(0.8);
                newCard.setInteractive({ cursor: 'pointer' });
                this.scene.input.setDraggable(newCard);
                this.scene.children.bringToTop(newCard);

                const centerX = this.scene.scale.gameSize.width / 2;
                const centerY = this.scene.scale.gameSize.height / 2;

                this.scene.tweens.add({
                    targets: newCard,
                    x: centerX,
                    y: centerY + (this.scene.scale.gameSize.height > this.scene.scale.gameSize.width ? -20 : 60),
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 350,
                    ease: 'Back.easeOut'
                });

                this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
            }
        });
    }

    private setupDragEvents() {
        this.scene.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: GameObjects.Image) => {
            if (this.playerHand.includes(gameObject) || gameObject.getData('isNewDraw')) {
                gameObject.setTint(0xffaaaa);
                this.scene.children.bringToTop(gameObject);

                if (this.playerHand.getTotalCardCount() === 10) {
                    this.tableManager.discardPile.setFillStyle(0xff0000, 0.4);
                    this.tableManager.discardPile.setStrokeStyle(6, 0xff0000, 1.0);
                }
            }
        });

        this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: GameObjects.Image, dragX: number, dragY: number) => {
            if (this.playerHand.includes(gameObject) || gameObject.getData('isNewDraw')) {
                gameObject.x = dragX;
                gameObject.y = dragY;

                if (this.playerHand.getTotalCardCount() === 10) {
                    const distToDiscard = PhaserMath.Distance.Between(gameObject.x, gameObject.y, this.tableManager.discardPile.x, this.tableManager.discardPile.y);
                    if (distToDiscard < 120) {
                        this.tableManager.discardPile.setFillStyle(0x00ff00, 0.5);
                        this.tableManager.discardPile.setStrokeStyle(6, 0x00ff00, 1.0);
                    } else {
                        this.tableManager.discardPile.setFillStyle(0xff0000, 0.4);
                        this.tableManager.discardPile.setStrokeStyle(6, 0xff0000, 1.0);
                    }
                }
            }
        });

        this.scene.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: GameObjects.Image) => {
            const isNewDraw = gameObject.getData('isNewDraw');
            const inHand = this.playerHand.includes(gameObject);

            if (!inHand && !isNewDraw) return;

            const totalCardsBeforeDrop = this.playerHand.getTotalCardCount();

            this.tableManager.discardPile.setFillStyle(0x000000, 0.3);
            this.tableManager.discardPile.setStrokeStyle(4, 0xffff00, 0.8);

            gameObject.clearTint();
            gameObject.setDepth(0);

            if (isNewDraw) {
                gameObject.setData('isNewDraw', false);
                this.playerHand.setFloatingCard(null);
                gameObject.setScale(0.8);
            }

            const distToDiscard = PhaserMath.Distance.Between(gameObject.x, gameObject.y, this.tableManager.discardPile.x, this.tableManager.discardPile.y);

            if (distToDiscard < 120 && this.gameController.currentTurn === 'player') {
                if (totalCardsBeforeDrop < 10) {
                    this.gameUI.showMessage('You must draw a card before discarding!', '#ff0000');
                    this.playerHand.sortVisually();
                    this.scene.time.delayedCall(2000, () => {
                        this.gameUI.showMessage('Your Turn!\nDraw a card, then discard.', '#00ff00');
                    });
                    return;
                }

                this.scene.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();

                if (inHand) {
                    this.playerHand.removeCard(gameObject);
                    this.playerHand.rearrange();
                }

                this.tableManager.addDiscard(gameObject);

                gameObject.x = this.tableManager.discardPile.x;
                gameObject.y = this.tableManager.discardPile.y;
                gameObject.angle = Math.random() * 20 - 10;

                this.gameController.startTurn('bot');

            } else {
                if (isNewDraw) {
                    this.playerHand.addCardRaw(gameObject);
                }
                this.playerHand.sortVisually();
            }
        });
    }
}
