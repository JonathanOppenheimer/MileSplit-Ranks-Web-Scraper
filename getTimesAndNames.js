const cheerio = require('cheerio');
const got = require('got');
const fs = require('fs');
const basic = require('./json-output/basic.json');
const meetURLS = require('./json-output/goodMeetURLs.json');
const racePlacements = require('./json-output/racePlacements.json');
const genderAndEvent = require('./json-output/genderAndEvent.json');

let finalTimesArray = [
    ['Rank', 'Name', 'School', 'Times', 'Meet']
];

let gender = genderAndEvent[0];
let event = genderAndEvent[1];

//turns JSON file into array
let goodMeetURLS = meetURLS.map(function (item) {
    return Object.values(item);
});

let htmlContent = '';

//Run functions area
//-------------------------------------------//

formatArays();
exportToHTML();

//Main work done below
//-------------------------------------------//

//Formats finalTimesArray 
function formatArays() {
    finalTimesArray = basic;
    finalTimesArray[0][1] = "Name";
    finalTimesArray[0][3] = "Time";
    finalTimesArray.pop();
    goodMeetURLS.sort(sortBySecondColumn);
}

//Sorts a 2d array by it's second column
function sortBySecondColumn(column1, column2) {
    if (column1[1] === column2[1]) {
        return 0;
    }
    else {
        return (column1[1] < column2[1]) ? -1 : 1;
    }
}

//Exports work to an HTML table for viewing
async function exportToHTML() {
    await fillNamesAndTimes();
    console.table(finalTimesArray);
    htmlContent = htmlContent + makeTableHTML(finalTimesArray);
    fs.writeFileSync('output/output.html', htmlContent, (error) => { console.log(error) });
}

//All functions below help fill the JS table (finalTimesArray)

function fillNamesAndTimes() {
    return new Promise((resolve, reject) => {
        let counter = 0;

        for (let i = 0; i < meetURLS.length; i++) {
            counter++;
            getNamesAndTimes(goodMeetURLS[i][0], racePlacements[i], counter);
        }

        setTimeout(() => {
            resolve();
            ;
        }, 5000
        );
    });
}

async function getNamesAndTimes(meetURL, racePlacement, position) {
    got(meetURL).then(response => {
        let name = '';
        let time = '';
        const $ = cheerio.load(response.body);
        $('#page').each(function (i) {
            try {
                //Messes with the raw text output until an array with just the person's details is created
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

                let tempArray = text;
                name = text[1] + ' ' + text[2];
                //If the name has undefined in it, just make it Unknown -- can look into later
                if (name.search('undefined') > -1) {
                    //name = "Unknown"
                }
                //Works it way backwards from the bottom of the array looking for a valid time. 
                //This can definitly be cleaned up
                time = tempArray[tempArray.length - 1];
                if (validTime(time) == false) {
                    time = tempArray[tempArray.length - 2];
                    if (validTime(time) == false) {
                        time = tempArray[tempArray.length - 3];
                        if (validTime(time) == false) {
                            time = tempArray[tempArray.length - 4];
                            if (validTime(time) == false) {
                                time = "Unknown";
                            }
                        }
                    }
                }
            }
            catch {
                time = 'Unknown';
                name = 'Unknown';
            }
            finalTimesArray[position][1] = name;
            finalTimesArray[position][3] = time;
            //console.table(finalTimesArray);
            return position;
        });
    });
    return;
}

//Function to see if the time is valid 
function validTime(time) {
    //Checks if it's a string or under 9 seconds (the under 9 seconds needs to be adjusted because sometimes a time could actually be under 9 seconds if it's 55m or something) 
    if (isNaN(parseInt(time)) == true || parseInt(time) < 9) {
        //Sometimes the time is still valid if only the first character is a string see
        //https://en.wikipedia.org/wiki/Athletics_abbreviations#Records
        //Longer term need to check more than just the first character 
        if ((/[a-zA-Z]/).test(time.charAt(0)) && time.length > 1) {
            let testAgain = time.slice(1);
            if (validTime(testAgain) == true) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
}

function makeTableHTML(myArray) {
    var result = " <head> <link rel='stylesheet' href='style.css'> </head> <table border=1 id='times'>";
    for (var i = 0; i < myArray.length; i++) {
        result += "<tr>";
        for (var j = 0; j < myArray[i].length; j++) {
            if (i == 0 && j < 5) {
                result += "<th>" + myArray[i][j] + "</th>";
            }
            else {
                result += "<td>" + myArray[i][j] + "</td>";
            }

        }
        result += "</tr>";
    }
    result += "</table>";

    result += ""
    return result;
}
