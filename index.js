const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const TEXT = require('./text');
const AUDIO = require('./audio');

const token = config.token;
const bot = new TelegramBot(token, {
    polling: true
});

const sendMsg = (chatID, content, type) => {
    return new Promise((resolve, reject) => {
        if (type === 'audio') {
            bot.sendAudio(chatID, content).then((data) => resolve(data)).catch(reject);
        } else {
            bot.sendMessage(chatID, content).then((data) => resolve(data)).catch(reject);
        }
    });
};

const deleteMsg = (chatID, msgID) => {
    return new Promise((resolve, reject) => {
        bot.deleteMessage(chatID, msgID).then((data) => resolve(data)).catch(reject);
    });
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
            sendMsg(chatID, AUDIO.TIME[nowHr + '00']).then((msg) => {
                setTimeout(() => {
                    deleteMsg(chatID, msg.message_id).then().catch();
                }, 60 * 60 * 1000);
            }).catch();
            lastHr = nowHr;
        }
    }, 60 * 1000);
};
const stopTiming = () => {
    isTiming = false;
};
bot.onText(/\/kitakami (.+)/, (msg, match) => {
    const command = match[1].split(' ');
    const key = command[0];
    const method = command[1];
    let res = '';
    let type = 'text';
    let time = 60 * 1000;
    switch (key) {
        case 'help':
            res = 'help\ntime XXXX\ntalk home|marry|attack|hurt|powerup|shower|sink';
            break;
        case 'time':
            res = AUDIO.TIME[method] || '';
            type = 'audio';
            break;
        case 'talk':
            let arr = TEXT.TALK[method];
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
            res = TEXT.OOI;
            break;
        case 'abukuma':
            res = TEXT.ABUKUMA;
            break;
        default:
            break;
    }
    if (res) {
        sendMsg(msg.chat.id, res, type).then((msg) => {
            setTimeout(() => {
                deleteMsg(msg.chat.id, msg.message_id).then().catch();
            }, time);
        }).catch();
    }
});
