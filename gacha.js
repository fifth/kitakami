const request = require('request');
const cheerio = require('cheerio');

const URL_PREFIX = 'https://bgm.tv';
let username = 'aflyhorse';
let index = 0;

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(cheerio.load(body));
                return;
            }
            reject();
        });
    });
};

module.exports = {
    run: (username) => {
        return new Promise((resolve, reject) => {
            fetchUrl(`${URL_PREFIX}/anime/list/${username}/wish`)
            .then(($) => {
                const totalCount = parseInt($('#headerProfile .navSubTabsWrapper .navSubTabs').children().first().find('span').html().match(/\d+/g).pop() || 0, 10);
                const luckyNum = Math.floor(Math.random() * totalCount);
                let page = Math.ceil(luckyNum / 24);
                index = luckyNum % 24;
                if (index <= 0) {
                    index += 24;
                }
                if (page === 1) {
                    resolve(URL_PREFIX + $('.mainWrapper #browserItemList').children().eq(index - 1).find('a.subjectCover').attr('href'));
                } else {
                    fetchUrl(`${URL_PREFIX}/anime/list/${username}/wish?page=${page}`)
                    .then(($) => resolve(URL_PREFIX + $('.mainWrapper #browserItemList').children().eq(index - 1).find('a.subjectCover').attr('href')))
                    .catch(reject);
                }
            })
            .catch(reject);
        });
    }
};
