import { Scene, GameObjects } from 'phaser';
import { Card } from './Card';

export class BotHand {
    private scene: Scene;
    private cards: GameObjects.Image[] = [];
    private screenWidth = 1024;
    private screenHeight = 768;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public addCard(card: GameObjects.Image) {
        this.cards.push(card);
        this.rearrange();
    }

    public removeCard(card: GameObjects.Image) {
        this.cards = this.cards.filter(c => c !== card);
        this.rearrange();
    }

    public getCards(): GameObjects.Image[] {
        return this.cards;
    }

    public getLength(): number {
        return this.cards.length;
    }

    public handleResize(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.rearrange();
    }

    public rearrange() {
        const totalCards = this.cards.length;
        if (totalCards === 0) return;

        const maxHandWidth = this.screenWidth * 0.7; // slightly smaller than player hand
        let spacing = 50;
        if (totalCards > 1) {
            const desiredWidth = (totalCards - 1) * spacing;
            if (desiredWidth > maxHandWidth) {
                spacing = maxHandWidth / (totalCards - 1);
            }
        }

        const startX = (this.screenWidth / 2) - ((totalCards - 1) * spacing) / 2;

        for (let i = 0; i < totalCards; i++) {
            const card = this.cards[i];

            // Invert the fanning for the top screen
            const angleMultiplier = spacing < 50 ? 1 : 2;
            const angle = -(i - (totalCards - 1) / 2) * angleMultiplier; 
            const yOffset = Math.abs(i - (totalCards - 1) / 2) * 5;

            // Position near the top of the screen
            const targetY = 130 - yOffset;
            card.setData('baseY', targetY);

            // Animate to position
            this.scene.tweens.add({
                targets: card,
                x: startX + (i * spacing),
                y: targetY,
                angle: angle,
                duration: 250,
                ease: 'Power2'
            });
            
            // For the bot, cards face down
            card.setScale(0.6); // slightly smaller

            this.scene.children.bringToTop(card);
        }
    }
}
