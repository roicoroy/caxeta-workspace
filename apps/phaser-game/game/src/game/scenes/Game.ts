import { Scene, Math as PhaserMath } from 'phaser';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { PlayerHand } from '../models/PlayerHand';
import { BotHand } from '../models/BotHand';
import { GameUI } from '../models/GameUI';
import { BotService } from '../services/BotService';
import { TableManager } from '../managers/TableManager';
import { GameController } from '../managers/GameController';
import { GameInputHandler } from '../managers/GameInputHandler';

export class Game extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;

    public deck!: Deck;
    public playerHand!: PlayerHand;
    public botHand!: BotHand;
    public gameUI!: GameUI;
    public botService!: BotService;

    public tableManager!: TableManager;
    public gameController!: GameController;
    public inputHandler!: GameInputHandler;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;

        // Add the table background
        this.background = this.add.image(0, 0, 'table_bg');

        // Initialize our basic models
        this.gameUI = new GameUI(this);
        this.playerHand = new PlayerHand(this);
        this.botHand = new BotHand(this);
        this.botService = new BotService(this);
        this.deck = new Deck(2);
        this.deck.shuffle();

        // Initialize Managers
        this.tableManager = new TableManager(this);
        
        this.gameController = new GameController(
            this,
            this.gameUI,
            this.botService,
            this.playerHand,
            this.botHand
        );

        this.inputHandler = new GameInputHandler(
            this,
            this.playerHand,
            this.tableManager,
            this.gameController,
            this.deck,
            this.gameUI
        );
        this.inputHandler.initialize();

        // Deal a starting hand of 9 cards to player
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

        this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
        this.gameController.startTurn('player');

        // Setup Bateu logic via Controller
        this.gameUI.createBateuButton(() => {
            this.gameController.handleBateuAttempt();
        });

        // Setup Menu button
        this.gameUI.createMenuButton(() => {
            this.scene.start('MainMenu');
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

        this.tableManager.handleResize(centerX, centerY, isPortrait);
        this.playerHand.handleResize(width, height);
        this.botHand.handleResize(width, height);
        this.gameUI.handleResize(width, height, this.tableManager.drawDeck.x, this.tableManager.drawDeck.y);
    }

    // --- Methods delegated for BotService ---

    public getTopDiscardCardData(): Card | null {
        return this.tableManager.getTopDiscardCardData();
    }

    public drawCardForBot() {
        if (this.deck.getRemainingCount() > 0) {
            const drawnCards = this.deck.draw(1);
            const newCardData = drawnCards[0];
            const newCard = this.add.image(this.tableManager.drawDeck.x, this.tableManager.drawDeck.y, 'cards', 'back-side');
            newCard.setData('cardData', newCardData);
            this.botHand.addCard(newCard);
            this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
        }
    }

    public drawFromDiscardForBot() {
        if (this.tableManager.hasDiscards()) {
            const topCardSprite = this.tableManager.popTopDiscard();
            if (topCardSprite) {
                this.children.bringToTop(topCardSprite);
                topCardSprite.setTexture('cards', 'back-side'); // turn it face down for bot
                this.botHand.addCard(topCardSprite);
                this.tableManager.updateDeckVisuals(this.deck.getRemainingCount());
            }
        }
    }

    public discardBotCard(card: Phaser.GameObjects.Image) {
        this.botHand.removeCard(card);
        this.tableManager.addDiscard(card);

        card.setTexture('cards', (card.getData('cardData') as Card).getTextureName()); // flip face up
        card.disableInteractive();

        this.children.bringToTop(card);

        this.tweens.add({
            targets: card,
            x: this.tableManager.discardPile.x,
            y: this.tableManager.discardPile.y,
            angle: Math.random() * 20 - 10,
            scale: 0.8,
            duration: 350,
            onComplete: () => {
                this.gameController.startTurn('player');
            }
        });
    }

    public discardBotCardForWin(card: Phaser.GameObjects.Image) {
        this.botHand.removeCard(card);
        this.tableManager.addDiscard(card);

        card.setTexture('cards', (card.getData('cardData') as Card).getTextureName());
        card.disableInteractive();
        this.children.bringToTop(card);

        this.tweens.add({
            targets: card,
            x: this.tableManager.discardPile.x,
            y: this.tableManager.discardPile.y,
            angle: Math.random() * 20 - 10,
            scale: 0.8,
            duration: 350
        });
    }

    public triggerBotWin(isPife = false) {
        this.gameController.triggerBotWin(isPife);
    }
}
