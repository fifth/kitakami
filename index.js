const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const TEXT = require('./text');
const AUDIO = require('./audio');

const timing = require('./timing');
const gacha = require('./gacha');

const token = config.token;
const bot = new TelegramBot(token, {
    polling: true
});

const sendMsg = (chatID, content, type, replyToID) => {
    return new Promise((resolve, reject) => {
        if (type === 'audio') {
            bot.sendAudio(chatID, content).then((data) => resolve(data)).catch(reject);
        } else {
            bot.sendMessage(chatID, content, null, null, null, replyToID).then((data) => resolve(data)).catch(reject);
        }
    });
};

const deleteMsg = (chatID, msgID) => {
    return new Promise((resolve, reject) => {
        bot.deleteMessage(chatID, msgID).then((data) => resolve(data)).catch(reject);
    });
};

bot.onText(/[0-9A-Za-z_@]+/, (msg, match) => {
    const command = match[0];
    let res = '';
    let type = 'text';
    let time = 60 * 1000;
    switch (command) {
        case 'start_alarm':
            timing.start(msg.chat.id, sendMsg, deleteMsg);
            break;
        case 'stop_alarm':
            timing.stop();
            break;
        case 'gacha':
            let username = msg.text.match(/[0-9A-Za-z_@]+/g)[1] || '';
            if (username) {
                gacha.run(username).then((url) => {
                    if (!url) {
                        sendMsg(msg.chat.id, url, 'text', msg.from.id);
                    }
                }).catch();
            } else {
                sendMsg(msg.chat.id, 'not found');
            }
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
