import { Scene, GameObjects } from 'phaser';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';

export class TableManager {
    public discardPile: GameObjects.Rectangle;
    public drawDeck: GameObjects.Image;
    private discardedSprites: GameObjects.Image[] = [];
    
    constructor(private scene: Scene) {
        // Add Discard Pile placeholder
        this.discardPile = this.scene.add.rectangle(0, 0, 154 * 0.8, 222 * 0.8, 0x000000, 0.3);
        this.discardPile.setStrokeStyle(4, 0xffff00, 0.8);
        this.discardPile.setInteractive({ cursor: 'pointer' });

        // Add the Draw Deck pile
        this.drawDeck = this.scene.add.image(0, 0, 'cards', 'back-side');
        this.drawDeck.setScale(0.8);
        this.drawDeck.setInteractive({ cursor: 'pointer' });
    }

    public handleResize(centerX: number, centerY: number, isPortrait: boolean) {
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
    }

    public updateDeckVisuals(remainingCount: number) {
        if (remainingCount === 0) {
            this.drawDeck.setAlpha(0.2);
        } else {
            this.drawDeck.setAlpha(1.0);
        }
    }

    public addDiscard(cardSprite: GameObjects.Image) {
        this.discardedSprites.push(cardSprite);
        if (this.discardedSprites.length > 5) {
            const oldestSprite = this.discardedSprites.shift();
            if (oldestSprite) {
                oldestSprite.destroy();
            }
        }
    }

    public hasDiscards(): boolean {
        return this.discardedSprites.length > 0;
    }

    public popTopDiscard(): GameObjects.Image | undefined {
        return this.discardedSprites.pop();
    }

    public getTopDiscardCardData(): Card | null {
        if (this.discardedSprites.length === 0) return null;
        return this.discardedSprites[this.discardedSprites.length - 1].getData('cardData') as Card;
    }

    public recycleDiscards(deck: Deck) {
        const cardsToRecycle = this.discardedSprites.map(sprite => sprite.getData('cardData') as Card);
        deck.recycle(cardsToRecycle);

        this.discardedSprites.forEach(sprite => sprite.destroy());
        this.discardedSprites = [];
    }
}
