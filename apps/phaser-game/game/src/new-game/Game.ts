import { Scene, Math as PhaserMath } from 'phaser';

export class NewGame extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.add.text(512, 384, 'Game Screen', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const backBtn = this.add.text(50, 50, '< Back', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#ffff00'));
        backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));

        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
