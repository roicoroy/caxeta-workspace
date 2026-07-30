import { Scene, GameObjects } from 'phaser';
import { Card } from './Card';
import { MeldValidator } from '../services/MeldValidator';

export class PlayerHand {
    private scene: Scene;
    private cards: GameObjects.Image[] = [];
    private floatingCard: GameObjects.Image | null = null;
    private screenWidth = 1024;
    private screenHeight = 768;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public addCard(card: GameObjects.Image) {
        // Insert the new card at a random index in the hand to simulate inserting it randomly
        const insertIndex = Math.floor(Math.random() * (this.cards.length + 1));
        this.cards.splice(insertIndex, 0, card);
        this.bindHoverEvents(card);
        this.rearrange();
    }

    public addCardRaw(card: GameObjects.Image) {
        this.cards.push(card);
        this.bindHoverEvents(card);
    }

    public removeCard(card: GameObjects.Image) {
        this.cards = this.cards.filter(c => c !== card);
    }

    public getCards(): GameObjects.Image[] {
        return this.cards;
    }

    public sortVisually() {
        this.cards.sort((a, b) => a.x - b.x);
        this.rearrange();
    }

    public getLength(): number {
        return this.cards.length;
    }

    public setFloatingCard(card: GameObjects.Image | null) {
        this.floatingCard = card;
    }

    public getTotalCardCount(): number {
        return this.cards.length + (this.floatingCard ? 1 : 0);
    }

    public includes(card: GameObjects.Image): boolean {
        return this.cards.includes(card);
    }




    public handleResize(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.rearrange();
    }

    public rearrange() {
        const cardDataList = this.cards.map(c => c.getData('cardData') as Card);
        const inMeld = MeldValidator.identifyMelds(cardDataList);

        const totalCards = this.cards.length;

        // Calculate dynamic spacing based on screen width
        const maxHandWidth = this.screenWidth * 0.9; // Hand takes up max 90% of screen width
        let spacing = 65;
        if (totalCards > 1) {
            const desiredWidth = (totalCards - 1) * spacing;
            if (desiredWidth > maxHandWidth) {
                spacing = maxHandWidth / (totalCards - 1);
            }
        }

        const startX = (this.screenWidth / 2) - ((totalCards - 1) * spacing) / 2;

        for (let i = 0; i < totalCards; i++) {
            const card = this.cards[i];

            card.setData('wasInMeld', inMeld[i]);

            // Fan out slightly less if squeezed
            const angleMultiplier = spacing < 65 ? 1 : 2;
            const angle = (i - (totalCards - 1) / 2) * angleMultiplier;
            const yOffset = Math.abs(i - (totalCards - 1) / 2) * 5;

            // Position near the bottom of the screen
            const targetY = this.screenHeight - 140 + yOffset;
            card.setData('baseY', targetY);

            card.clearTint();

            card.x = startX + (i * spacing);
            card.y = targetY;
            card.angle = angle;

            this.scene.children.bringToTop(card);
        }
    }

    private bindHoverEvents(card: GameObjects.Image) {
        // Animations temporarily disabled for development
        // to focus purely on game mechanics.
    }
}
