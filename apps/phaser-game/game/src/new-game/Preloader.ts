import { Scene } from 'phaser';

export class NewaGamePreloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        
        // Sticker Knight UI assets
        this.load.setPath('assets/sticker-knight/ui');
        this.load.image('backgroundSet', 'backgroundSet.png');
        this.load.image('titleLogo', 'title.png');
        this.load.image('buttonStart', 'buttonStart.png');
        this.load.image('buttonHelp', 'buttonHelp.png');
        this.load.image('helpBackground', 'helpBackground.png');
        this.load.image('cloud', 'cloud.png');
        this.load.image('streaksFade', 'streaksFade.png');
        
        // Custom background
        this.load.setPath('assets');
        this.load.image('tableBackground', 'game-table-home-table.webp');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
