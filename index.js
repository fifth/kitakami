// const TelegramBot = require('node-telegram-bot-api');
// const token = '323627214:AAGg7BpaiHe72FoQg1sCHXnaeGtgCdyfTew';
// const bot = new TelegramBot(token, {
//     polling: true
// });
const TEXT = require('./constants');
const AUDIO = require('./audio');

const doReply = (chatID, content, type) => {
    if (type === 'audio') {
        bot.sendAudio(chatID, content);
    }
    else {
        bot.sendMessage(chatID, content);
    }
};

let lastHr;
let nowHr;
let isTiming = false;
const startTiming = chatID => {
    isTiming = true;
    lastHr = new Date().getHours();
    let t = setInterval(() => {
        if (!isTiming) {
            clearInterval(t);
            return;
        }
        nowHr = new Date().getHours();
        if (nowHr !== lastHr) {
            doReply(chatID, VOICE.TIME[nowHr + '00']);
            lastHr = nowHr;
        }
    }, 300 * 1000);
};
const stopTiming = () => {
    isTiming = false;
};
bot.onText(/\/kitakami (.+)/, (msg, match) => {
    const command = match[1].split(' ');
    const key = command[0];
    let res = '';
    let type = 'text',
    switch (key) {
        case 'help':
            res = 'help\ntime XXXX\ntalk home|marry|attack|hurt|powerup|shower|sink';
            break;
        case 'time':
            res = VOICE.TIME[command[1]] || '';
            type = 'audio';
            break;
        case 'talk':
            let arr = VOICE.TALK[command[1]];
            if (arr) {
                let len = arr.length;
                if (len > 0) {
                    res = arr[Math.floor(Math.random() * len)] || '';
                }
            }
            break;
        case 'start_alarm':
            startTiming(msg.chat.id);
            break;
        case 'stop_alarm':
            stopTiming();
            break;
        case 'ooi':
            res = VOICE.OOI;
            break;
        case 'abukuma':
            res = VOICE.ABUKUMA;
            break;
        default:
            break;
    }
    if (res) {
        doReply(msg.chat.id, res, type);
    }
});
*/
