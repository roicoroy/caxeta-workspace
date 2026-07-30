import { Boot } from './game/scenes/Boot';
import { GameOver } from './game/scenes/GameOver';
import { Game as MainGame } from './game/scenes/Game';
import { MainMenu } from './game/scenes/MainMenu';
import { Options } from './game/scenes/Options';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './game/scenes/Preloader';

export const GAME_CONFIG = {
    isDevelopment: true,
    showStartPage: true
};

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Options,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;

const game = StartGame('game-container');
