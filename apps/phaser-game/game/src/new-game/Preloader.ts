import { Scene } from 'phaser';

export class NewaGamePreloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
