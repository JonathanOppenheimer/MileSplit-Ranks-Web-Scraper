const cheerio = require('cheerio');
const got = require('got');
const basic = require('./json-output/basic.json');
const meetURLS = require('./json-output/goodMeetURLs.json');
const meetNames = require('./json-output/meetNames.json');
const racePlacements = require('./json-output/racePlacements.json');
const genderAndEvent = require('./json-output/genderAndEvent.json');

let finalTimesArray = [
    ['Rank', 'Name', 'School', 'Times', 'Meet']
];

let gender = genderAndEvent[0];
let event = genderAndEvent[1];

let times = [];
let names = [];

//turns JSON files into array
let basicArray = basic.map(function (item) {
    return Object.values(item);
});

//Run functions area
//-------------------------------------------//

formatArays();
fillNamesAndTimes();


//Main work done below
//-------------------------------------------//

function formatArays() {
    //Moves elements around and renames certain cells
    for (i in basicArray) {
        finalTimesArray.splice(i, 0, basicArray[i]);
        finalTimesArray[i][4] = meetNames[i];
    }
    finalTimesArray[0][1] = "Name";
    finalTimesArray[0][3] = "Time";

    var temp = finalTimesArray.map(function (arr) {
        return arr.slice();
    });

    for (i = 0; i < finalTimesArray.length - 1; i++) {
        finalTimesArray[i + 1][4] = temp[i][4];
    }
    finalTimesArray[0][4] = "Meet";
    finalTimesArray.pop();
    finalTimesArray.pop();
}

function fillNamesAndTimes() {
    for (let i = 0; i < meetURLS.length; i++) {
        //Need to wait until this function completes before doing again.
        //Annoying af
        getNamesAndTimes(meetURLS[i], racePlacements[i], function () {
            console.log(i + " Done");
        });
    }
}

function getNamesAndTimes(meetURL, racePlacement, callback) {
    got(meetURL).then(response => {
        let name = '';
        let time = '';
        const $ = cheerio.load(response.body);
        $('#page').each(function (i) {
            try {
                var text = $(this).text().trim();
                var position1 = text.search(gender + ' ' + event);
                text = text.slice(position1, -1);
                var position2 = text.indexOf(gender, text.indexOf(gender) + 1);
                text = text.slice(0, position2);
                text = text.split('\n')
                text = text[parseInt(racePlacement) + 3];
                text = text.trim();
                text = text.replace(/ +(?= )/g, '');
                text = text.split(' ');
                name = text[1] + ' ' + text[2];

                time = text[5];
                if (isNaN(parseInt(time)) == true || parseInt(time) < 9) {
                    time = 'Unknown'
                }
                else {
                    time = time;
                }
            }
            catch {
                time = 'Unknown';
                name = 'Unknown';
            }
            times.push(time);
            names.push(name);
            callback();
        });
    });
}

