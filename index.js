const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const TEXT = require('./text');
const AUDIO = require('./audio');
const MEMBERS = require('./members');

const timing = require('./timing');
const gacha = require('./gacha');

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

bot.onText(/[\S]+/, (msg, match) => {
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
            let username = MEMBERS[msg.from.id] || '';
            if (username) {
                gacha.run(username).then((url) => {
                    sendMsg(msg.chat.id, url);
                }).catch();
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
