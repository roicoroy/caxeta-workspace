import { Scene, GameObjects } from 'phaser';

export class NewMainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.title = this.add.text(512, 300, 'New Game Boilerplate', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const btnText = this.add.text(512, 450, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Hover effects
        btnText.on('pointerover', () => btnText.setColor('#ffff00'));
        btnText.on('pointerout', () => btnText.setColor('#ffffff'));

        btnText.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
