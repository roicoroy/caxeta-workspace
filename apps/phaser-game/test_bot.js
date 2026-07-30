const fs = require('fs');
const code = fs.readFileSync('src/game/services/BotService.ts', 'utf8');
console.log(code);
