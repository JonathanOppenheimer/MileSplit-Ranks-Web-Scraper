const cheerio = require('cheerio');
const got = require('got');

let meetURLS = ['https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/424113',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/424304',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/427940',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/432612',
    'https://va.milesplit.com/meets/424113',
    'https://va.milesplit.com/meets/413057',
    'https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/424479',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/423424',
    'https://va.milesplit.com/meets/432612',
    'https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/423210',
    'https://va.milesplit.com/meets/424113',
    'https://va.milesplit.com/meets/425850',
    'https://va.milesplit.com/meets/424479',
    'https://va.milesplit.com/meets/422441',
    'https://va.milesplit.com/meets/424479',
    'https://va.milesplit.com/meets/424113',
    'https://va.milesplit.com/meets/429903',
    'https://va.milesplit.com/meets/421398',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/427105',
    'https://va.milesplit.com/meets/421398',
    'https://va.milesplit.com/meets/422441',
    'https://va.milesplit.com/meets/427636',
    'https://va.milesplit.com/meets/413057',
    'https://va.milesplit.com/meets/422441',
    'https://va.milesplit.com/meets/423190',
    'https://va.milesplit.com/meets/426894',
    'https://va.milesplit.com/meets/424304',
    'https://va.milesplit.com/meets/431917',
    'https://va.milesplit.com/meets/413057',
    'https://va.milesplit.com/meets/425157',
    'https://va.milesplit.com/meets/429903',
    'https://va.milesplit.com/meets/427105']
let goodMeetURLS = [];



changeURL();
console.table(goodMeetURLS);

function changeURL() {
    for (i = 0; i < meetURLS.length; i++) {
        got(meetURLS[i]).then(response => {
            const $ = cheerio.load(response.body);
            let good_url = "";
            if (response.body.search('class="meetResultsList"') > -1) {
                good_url = $('.meetResultsList').find('a').attr('href');
                good_url = good_url.replace('auto', 'raw');
            }
            else {
                good_url = $('#ddResultsView').find('option').attr('value');
                good_url = good_url.replace('formatted', 'raw');
            }
            goodMeetURLS.push(good_url);
            console.table(goodMeetURLS);
        }).catch(err => {
            console.log(err);
        });
    }
}