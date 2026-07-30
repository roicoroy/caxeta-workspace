import { Scene, Math as PhaserMath } from 'phaser';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { PlayerHand } from '../models/PlayerHand';
import { BotHand } from '../models/BotHand';
import { GameUI } from '../models/GameUI';
import { MeldValidator } from '../services/MeldValidator';
import { BotService } from '../services/BotService';

export class Game extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;

    private deck!: Deck;
    private playerHand!: PlayerHand;
    public botHand!: BotHand;
    private gameUI!: GameUI;
    private botService!: BotService;
    private currentTurn: 'player' | 'bot' = 'player';

    private discardedSprites: Phaser.GameObjects.Image[] = [];
    private discardPile!: Phaser.GameObjects.Rectangle;
    private drawDeck!: Phaser.GameObjects.Image;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        // Add the table background (centered later)
        this.background = this.add.image(0, 0, 'table_bg');

        // Initialize our new modules
        this.gameUI = new GameUI(this);
        this.playerHand = new PlayerHand(this);
        this.botHand = new BotHand(this);
        this.botService = new BotService(this);
        this.deck = new Deck(2);
        this.deck.shuffle();

        // Add Discard Pile placeholder (a rectangle)
        this.discardPile = this.add.rectangle(0, 0, 154 * 0.8, 222 * 0.8, 0x000000, 0.3);
        this.discardPile.setStrokeStyle(4, 0xffff00, 0.8);
        this.discardPile.setInteractive({ cursor: 'pointer' });

        // Click on Discard pile to pick up the top card
        this.discardPile.on('pointerdown', () => {
            if (this.currentTurn !== 'player') return;
            if (this.playerHand.getTotalCardCount() < 10 && this.discardedSprites.length > 0) {
                const topCardSprite = this.discardedSprites.pop();
                if (topCardSprite) {
                    this.children.bringToTop(topCardSprite); // ensure it renders on top
                    topCardSprite.setInteractive({ cursor: 'pointer' });
                    this.input.setDraggable(topCardSprite, true);

                    topCardSprite.setData('isNewDraw', true);
                    this.playerHand.setFloatingCard(topCardSprite);

                    const centerX = this.scale.gameSize.width / 2;
                    const centerY = this.scale.gameSize.height / 2;

                    // Animate to center of the table and grow
                    this.tweens.add({
                        targets: topCardSprite,
                        x: centerX,
                        y: centerY + (this.scale.gameSize.height > this.scale.gameSize.width ? -20 : 60),
                        scaleX: 1.0,
                        scaleY: 1.0,
                        angle: 0,
                        duration: 350,
                        ease: 'Back.easeOut'
                    });

                    updateDeckVisuals();
                }
            }
        });

        // Add the Draw Deck pile (Face down using the Atlas 'back-side' frame)
        this.drawDeck = this.add.image(0, 0, 'cards', 'back-side');
        this.drawDeck.setScale(0.8);
        this.drawDeck.setInteractive({ cursor: 'pointer' });

        const updateDeckVisuals = () => {
            this.updateDeckVisuals();
        };

        // Draw deck click event
        this.drawDeck.on('pointerdown', () => {
            if (this.currentTurn !== 'player') return;

            // If the deck is empty, clicking it will recycle the discard pile
            if (this.deck.getRemainingCount() === 0 && this.discardedSprites.length > 0) {
                const cardsToRecycle = this.discardedSprites.map(sprite => sprite.getData('cardData') as Card);
                this.deck.recycle(cardsToRecycle);

                this.discardedSprites.forEach(sprite => sprite.destroy());
                this.discardedSprites = [];

                updateDeckVisuals();
                return;
            }

            // Draw a card logic (Removed roundOver check, player can draw freely for testing)
            if (this.playerHand.getTotalCardCount() < 10 && this.deck.getRemainingCount() > 0) {
                const drawnCards = this.deck.draw(1);
                const newCardData = drawnCards[0];

                const newCard = this.add.image(this.drawDeck.x, this.drawDeck.y, 'cards', newCardData.getTextureName());
                newCard.setData('cardData', newCardData);
                newCard.setData('isNewDraw', true); // Mark as floating
                this.playerHand.setFloatingCard(newCard); // Track it in PlayerHand
                newCard.setScale(0.8); // Start at deck scale
                newCard.setInteractive({ cursor: 'pointer' });
                this.input.setDraggable(newCard);
                this.children.bringToTop(newCard);

                const centerX = this.scale.gameSize.width / 2;
                const centerY = this.scale.gameSize.height / 2;

                // Animate to center of the table and grow
                this.tweens.add({
                    targets: newCard,
                    x: centerX,
                    y: centerY + (this.scale.gameSize.height > this.scale.gameSize.width ? -20 : 60), // slightly higher on portrait
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 350,
                    ease: 'Back.easeOut'
                });

                // We do NOT add it to the hand array yet. The player must drag it.
                updateDeckVisuals();
            }
        });

        // Deal a starting hand of 9 cards
        const initialHandData = this.deck.draw(9);
        for (let i = 0; i < initialHandData.length; i++) {
            const cardData = initialHandData[i];

            const card = this.add.image(0, 900, 'cards', cardData.getTextureName());
            card.setData('cardData', cardData);
            card.setScale(0.8);
            card.setInteractive({ cursor: 'pointer' });
            this.input.setDraggable(card);

            this.playerHand.addCard(card);
        }

        // Deal a starting hand of 9 cards to bot
        const botInitialHandData = this.deck.draw(9);
        for (let i = 0; i < botInitialHandData.length; i++) {
            const cardData = botInitialHandData[i];
            const card = this.add.image(0, -100, 'cards', 'back-side');
            card.setData('cardData', cardData);
            card.setScale(0.6);
            this.botHand.addCard(card);
        }

        this.updateDeckVisuals();
        this.startTurn('player');

        // Setup Bateu logic
        this.gameUI.createBateuButton(() => {
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
                // Optionally lock hand
                this.playerHand.getCards().forEach(c => this.input.setDraggable(c, false));
            } else {
                this.gameUI.showMessage('Invalid Hand!\nNot all cards are in valid sets.', '#ff0000');
                // Reset message after a few seconds
                this.time.delayedCall(2000, () => {
                    this.gameUI.showMessage('Cachetão\nDraw a card, then discard a card!\nDrag cards within your hand to sort them.', '#ffffff');
                });
            }
        });

        // Setup Menu button
        this.gameUI.createMenuButton(() => {
            this.scene.start('MainMenu');
        });

        // Drag events
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.playerHand.includes(gameObject) || gameObject.getData('isNewDraw')) {
                gameObject.setTint(0xffaaaa);
                this.children.bringToTop(gameObject);

                // Show drop zone highlight
                this.discardPile.setFillStyle(0xff0000, 0.4);
                this.discardPile.setStrokeStyle(6, 0xff0000, 1.0);
            }
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            if (this.playerHand.includes(gameObject) || gameObject.getData('isNewDraw')) {
                gameObject.x = dragX;
                gameObject.y = dragY;

                // Highlight if close to drop zone
                const distToDiscard = PhaserMath.Distance.Between(gameObject.x, gameObject.y, this.discardPile.x, this.discardPile.y);
                if (distToDiscard < 120) {
                    this.discardPile.setFillStyle(0x00ff00, 0.5);
                    this.discardPile.setStrokeStyle(6, 0x00ff00, 1.0);
                } else {
                    this.discardPile.setFillStyle(0xff0000, 0.4);
                    this.discardPile.setStrokeStyle(6, 0xff0000, 1.0);
                }
            }
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            // Reset drop zone style
            this.discardPile.setFillStyle(0x000000, 0.3);
            this.discardPile.setStrokeStyle(4, 0xffff00, 0.8);
            const isNewDraw = gameObject.getData('isNewDraw');
            const inHand = this.playerHand.includes(gameObject);

            if (!inHand && !isNewDraw) return; // Ignore if not our cards

            gameObject.clearTint();
            gameObject.setDepth(0); // Ensure depth is reset when dropped

            if (isNewDraw) {
                gameObject.setData('isNewDraw', false);
                this.playerHand.setFloatingCard(null); // Clear floating state
                gameObject.setScale(0.8);
            }

            // If dropped near the discard pile
            // We can check distance to discard pile center
            const distToDiscard = PhaserMath.Distance.Between(gameObject.x, gameObject.y, this.discardPile.x, this.discardPile.y);

            if (distToDiscard < 120 && this.currentTurn === 'player') {

                // Disable dragging once played
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();

                // Remove from hand array if it was in hand
                if (inHand) {
                    this.playerHand.removeCard(gameObject);
                    this.playerHand.rearrange();
                }

                this.discardedSprites.push(gameObject);
                this.manageDiscardPileVisuals();

                // Snap to discard pile
                gameObject.x = this.discardPile.x;
                gameObject.y = this.discardPile.y;
                gameObject.angle = Math.random() * 20 - 10;

                this.startTurn('bot');

            } else {
                // The card was dropped back into the hand area!
                if (isNewDraw) {
                    this.playerHand.addCardRaw(gameObject);
                }

                // Sort the hand based on X coordinates so the user can visually reorder them
                this.playerHand.sortVisually();
            }
        });

        // Initialize responsive layout
        this.scale.on('resize', this.handleResize, this);
        this.handleResize(this.scale.gameSize);
    }

    handleResize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;
        const isPortrait = height > width;
        const centerX = width / 2;
        const centerY = height / 2;

        this.background.setPosition(centerX, centerY);
        if (isPortrait) {
            this.background.setTexture('table_bg_portrait');
        } else {
            this.background.setTexture('table_bg');
        }
        this.background.setDisplaySize(width, height);

        if (isPortrait) {
            this.discardPile.setPosition(centerX - 60, centerY - 80);
            this.drawDeck.setPosition(centerX + 60, centerY - 80);
        } else {
            this.discardPile.setPosition(centerX - 100, centerY);
            this.drawDeck.setPosition(centerX + 100, centerY);
        }

        this.discardedSprites.forEach(sprite => {
            sprite.setPosition(this.discardPile.x, this.discardPile.y);
        });

        this.playerHand.handleResize(width, height);
        this.botHand.handleResize(width, height);
        this.gameUI.handleResize(width, height, this.drawDeck.x, this.drawDeck.y);
    }

    public updateDeckVisuals() {
        this.gameUI.updateDeckCount(this.deck.getRemainingCount());
        if (this.deck.getRemainingCount() === 0) {
            this.drawDeck.setAlpha(0.2);
        } else {
            this.drawDeck.setAlpha(1.0);
        }
    }

    private manageDiscardPileVisuals() {
        if (this.discardedSprites.length > 5) {
            const oldestSprite = this.discardedSprites.shift();
            if (oldestSprite) {
                oldestSprite.destroy();
            }
        }
    }

    private startTurn(turn: 'player' | 'bot') {
        this.currentTurn = turn;
        if (turn === 'player') {
            this.gameUI.showMessage('Your Turn!\nDraw a card, then discard.', '#00ff00');
        } else {
            this.gameUI.showMessage('Opponent\'s Turn...', '#ffaaaa');
            this.botService.playTurn();
        }
    }

    public drawCardForBot() {
        if (this.deck.getRemainingCount() > 0) {
            const drawnCards = this.deck.draw(1);
            const newCardData = drawnCards[0];
            const newCard = this.add.image(this.drawDeck.x, this.drawDeck.y, 'cards', 'back-side');
            newCard.setData('cardData', newCardData);
            this.botHand.addCard(newCard);
            this.updateDeckVisuals();
        } else {
            // handle empty deck for bot later
        }
    }

    public getTopDiscardCardData(): Card | null {
        if (this.discardedSprites.length === 0) return null;
        return this.discardedSprites[this.discardedSprites.length - 1].getData('cardData') as Card;
    }

    public drawFromDiscardForBot() {
        if (this.discardedSprites.length > 0) {
            const topCardSprite = this.discardedSprites.pop();
            if (topCardSprite) {
                this.children.bringToTop(topCardSprite);
                topCardSprite.setTexture('cards', 'back-side'); // turn it face down for bot
                this.botHand.addCard(topCardSprite);
                this.updateDeckVisuals();
            }
        }
    }

    public discardBotCard(card: Phaser.GameObjects.Image) {
        this.botHand.removeCard(card);
        this.discardedSprites.push(card);

        card.setTexture('cards', (card.getData('cardData') as Card).getTextureName()); // flip face up
        card.disableInteractive();

        this.children.bringToTop(card);

        this.tweens.add({
            targets: card,
            x: this.discardPile.x,
            y: this.discardPile.y,
            angle: Math.random() * 20 - 10,
            scale: 0.8,
            duration: 350,
            onComplete: () => {
                this.manageDiscardPileVisuals();
                this.startTurn('player');
            }
        });
    }

    public discardBotCardForWin(card: Phaser.GameObjects.Image) {
        this.botHand.removeCard(card);
        this.discardedSprites.push(card);

        card.setTexture('cards', (card.getData('cardData') as Card).getTextureName());
        card.disableInteractive();
        this.children.bringToTop(card);

        this.tweens.add({
            targets: card,
            x: this.discardPile.x,
            y: this.discardPile.y,
            angle: Math.random() * 20 - 10,
            scale: 0.8,
            duration: 350
        });
    }

    public triggerBotWin(isPife = false) {
        if (isPife) {
            this.gameUI.showMessage('BOT PIFE!\nYou lost!\n(-2 Pts for you)', '#ff0000');
        } else {
            this.gameUI.showMessage('BOT BATEU!\nYou lost!\n(-1 Pt for you)', '#ff0000');
        }

        try {
            // Group the bot's cards
            const botCards = this.botHand.getCards();
            const cardDataList = botCards.map(c => c.getData('cardData') as Card);
            const orderedCardData = MeldValidator.getBestMeldGrouping(cardDataList);

            // Reorder the sprites safely
            botCards.sort((a, b) => {
                const dataA = a.getData('cardData');
                const dataB = b.getData('cardData');
                if (!dataA || !dataB) return 0;
                const indexA = orderedCardData.indexOf(dataA);
                const indexB = orderedCardData.indexOf(dataB);
                return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99);
            });

            // flip bot cards to show hand
            botCards.forEach(c => {
                const cd = c.getData('cardData');
                if (cd) c.setTexture('cards', (cd as Card).getTextureName());
            });

            this.botHand.rearrange();
        } catch (e) {
            console.error("Error during bot win grouping:", e);
            // Fallback: just flip the cards without grouping
            this.botHand.getCards().forEach(c => {
                const cd = c.getData('cardData');
                if (cd) c.setTexture('cards', (cd as Card).getTextureName());
            });
            this.botHand.rearrange();
        }
    }
}
