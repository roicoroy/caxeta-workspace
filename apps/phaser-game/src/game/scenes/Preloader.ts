import { Scene } from 'phaser';
import { GAME_CONFIG } from '../../main';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('table_bg', 'table_bg.png');
        this.load.image('table_bg_portrait', 'table_bg_portrait.png');
        // Load the cards texture atlas (which includes the back side and all faces)
        this.load.atlas('cards', 'cards.png', 'cards.json');
    }

    create() {
        if (GAME_CONFIG.showStartPage) {
            this.scene.start('MainMenu');
        } else {
            this.scene.start('Game');
        }
    }
}
