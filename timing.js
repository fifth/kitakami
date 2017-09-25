const AUDIO = require('./audio');
const ADJUST = 8;
let isTiming = false;
let lastHr;
let nowHr;

const start = (chatID, sendMethod, deleteMethod) => {
    if (isTiming) {
        return;
    }
    isTiming = true;
    lastHr = new Date().getHours();
    let t = setInterval(() => {
        if (!isTiming) {
            clearInterval(t);
            return;
        }
        nowHr = new Date().getHours();
        if (nowHr !== lastHr) {
            let voice = AUDIO.TIME[(nowHr + ADJUST) + '00'];
            sendMethod(chatID, voice, 'audio').then((msg) => {
                setTimeout(() => {
                    deleteMethod(chatID, msg.message_id).then().catch();
                }, 60 * 60 * 1000); // 1小时后删除
            }).catch();
            lastHr = nowHr;
        }
    }, 60 * 1000); // 每1分钟校对时间
};

const stop = () => {
    isTiming = false;
};

module.exports = { start, stop };
