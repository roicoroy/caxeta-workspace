import { Boot } from './game/scenes/Boot';
import { GameOver } from './game/scenes/GameOver';
import { Game as MainGame } from './game/scenes/Game';
import { MainMenu } from './game/scenes/MainMenu';
import { Options } from './game/scenes/Options';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './game/scenes/Preloader';

import { NewGameBoot } from './new-game/Boot';
import { NewGameOver } from './new-game/GameOver';
import { NewGame } from './new-game/Game';
import { NewMainMenu } from './new-game/MainMenu';
import { NewGameOptions } from './new-game/Options';
import { NewaGamePreloader } from './new-game/Preloader';

export const GAME_CONFIG = {
    isDevelopment: true,
    showStartPage: true,
    isNewGame: true
};

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const scenesNewGame = [
    NewGameBoot,
    NewaGamePreloader,
    NewMainMenu,
    NewGameOptions,
    NewGame,
    NewGameOver
];

const scenesOldGame = [
    Boot,
    Preloader,
    MainMenu,
    Options,
    MainGame,
    GameOver
];

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
    scene: GAME_CONFIG.isNewGame ? scenesNewGame : scenesOldGame
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;

const game = StartGame('game-container');
