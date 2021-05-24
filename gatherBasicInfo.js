const cheerio = require('cheerio');
const got = require('got');
const fs = require('fs');

//Change to rank list you're trying to scrape. Please ensure the event is in the proper format (e.g. "/100m?year")
const raceURL = 'https://va.milesplit.com/rankings/pro/high-school-boys/outdoor-track-and-field/100m?year=2021&accuracy=fat&league=6459';

//Variables for gender and race type
let gender = "Unknown";
let eventType = "Unknown";

//Sets up arrays for use
let times = [
    ['Rank', 'Name', 'School', 'Times']
];
let meetURLS = [];
let goodMeetURLS = [];
let racePlacements = [];
let meetNames = [];

//Run functions area
//-------------------------------------------//

getRaceDetails();
if (eventType != "Unknown" && gender != "Unknown") {
    printTable();
}
else {
    console.log("Sorry this link isn't quite right...");
}

//Main work done below
//-------------------------------------------//
function getRaceDetails() {
    //Sees if it's a boys, girls, men or women's race 
    if (raceURL.search("boys") > 0) {
        gender = "Boys";
    }
    else if (raceURL.search("men")) {
        gender = "Men";
    }
    else if (raceURL.search("girls")) {
        gender = "Girls";
    }
    else {
        gender = "Women";
    }
    //Get the event type
    eventType = raceURL;
    //Index of last slash
    let sPosition = eventType.lastIndexOf("/");
    //Index of year (?year=2021)
    let qPosition = eventType.search("year");
    eventType = eventType.slice(sPosition + 1, qPosition - 1);
    //Format event type correctly for different races
    if (eventType.search("m") > -1) {
        eventType = eventType.slice(0, -1);
        eventType = eventType + " Meter"
    }
    else if (eventType.search("55h") > -1 || eventType.search("100h") > -1 || eventType.search("110h") > -1 || eventType.search("300h") > -1) {
        eventType = eventType.slice(0, -1);
        eventType = eventType + " Meter Hurdles"
    }
    else if (eventType.search("s") > -1) {
        eventType = "Shot Put";
    }
    else if (eventType.search("d") > -1) {
        eventType = "Discus";
    }
    else if (eventType === "hj") {
        eventType = "High Jump";
    }
    else if (eventType === "lj") {
        eventType = "Long Jump";
    }
    else if (eventType === "tj") {
        eventType = "Triple Jump";
    }
    else if (eventType === "pv") {
        eventType = "Pole Vault";
    }
    else {
        eventType = "Unknown"
    }
}

//Gets the placements (usually 1-50) of the runners and inserts them into the array
//Also fills the times and names of the runners, which are unknown for now 
function getOverallRankAndFillBlank(callback) {
    got(raceURL).then(response => {
        const $ = cheerio.load(response.body);
        $('.1 .rank').each(function (i) {
            var text = $(this).text().trim();
            times.splice(i, 0, [text]);
        });
        //Adds school of student
        times[0][2] = "School";
        $('.1 .name .team').each(function (i) {
            var text = $(this).text().trim();
            times[i + 1][2] = text;
        });
        //Fills names and times with placeholder values
        for (i in times) {
            times[i][1] = "NameHere"
            times[i][3] = "0.00s";
        }
        callback();
    }).catch(err => {
        console.log(err);
        callback();
    });
}

//Gets the incomplete URL and pushes it to a seperate array
function getMeetURL(callback) {
    got(raceURL).then(response => {
        const $ = cheerio.load(response.body);
        //Get the meet links and push to a seperate array
        $('.meet a').each((i, link,) => {
            var href = link.attribs.href;
            var url = "https://va.milesplit.com" + href;
            meetURLS.push(url);
        });
        callback();
    }).catch(err => {
        console.log(err);
        callback();
    });
}

//Gets the place the student got at the race they ran in (e.g. 4th at that meet in 100m)
function getRacePlacement(callback) {
    got(raceURL).then(response => {
        const $ = cheerio.load(response.body);
        $('em').each(function (i) {
            var text = $(this).text().trim();
            var stringBuilder = "";
            //Cuts out the 'st' in 1st, the 'rd' in 3rd, etc. 
            for (i in text) {
                if (!(/[a-zA-Z]/).test(text[i])) {
                    stringBuilder = stringBuilder + text[i];
                }
            }
            //Pushes the trimmed placement to the racePlacements array.
            racePlacements.push(stringBuilder);
        });
        callback();
    }).catch(err => {
        console.log(err);
        callback();
    });
}

//Adds the name of the meet a student ran in
function getMeetName() {
    for (i in meetURLS) {
        got(meetURLS[i]).then(response => {
            const $ = cheerio.load(response.body);
            let text = $('.meetName').text().trim();
            meetNames.push(text);
            exportToJSON("json-output/meetNames.json", meetNames);
        }).catch(err => {
            console.log(err);
        });
    }
}

//Changes the URL of the meet to a readable one
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
            exportToJSON("json-output/goodMeetURLs.json", goodMeetURLS);
        }).catch(err => {
            console.log(err);
        });
    }
}

function exportToJSON(location, array) {
    fs.writeFile(location, JSON.stringify(array), function (err) {
        if (err) throw err;
    }
    );
}

//Prints the table after running the functions in reverse order
function printTable() {
    //Runs third
    getRacePlacement(() => {
        //Runs second
        getMeetURL(() => {
            //Runs first   
            changeURL();
            getMeetName();
            getOverallRankAndFillBlank(() => {
                //Runs last
                exportToJSON("json-output/basic.json", times);
                console.table(times);
            });
        });
    });
}
