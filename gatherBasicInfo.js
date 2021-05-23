const cheerio = require('cheerio');
const got = require('got');

//Change to rank list you're trying to scrape. Please ensure the event is in the proper format (e.g. "/100m?year")
const raceURL = 'https://va.milesplit.com/rankings/pro/high-school-boys/outdoor-track-and-field/100m?year=2021&accuracy=fat&league=6459';

//Finds gender and event
let gender = "alien";
let race = "moonwalk";


//Sets up arrays for use
let times = [
    ['Rank', 'Name', 'School', 'Times', 'Meet']
];
let meetURLS = [];
let racePlacements = [];

getRaceDetails();
printTable();

//-------------------------------------------//
function getRaceDetails() {
    //Sees if it's a boys or girls race 
    if (raceURL.search("boys") > 0) {
        gender = "Boys"
    }
    else {
        gender = "Girls"
    }
    //Get the event type

}
//-------------------------------------------//

//Main work done below

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

//Fills the meet the student ran at
function getMeetName(callback) {
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

//Prints the table after running the functions in reverse order
function printTable() {
    //Runs third
    getRacePlacement(() => {
        //Runs second
        getMeetName(() => {
            //Runs first
            getOverallRankAndFillBlank(() => {
                //Runs last
                console.table(times);
                console.table(meetURLS);
                console.table(racePlacements);
            });
        });
    });
}

/*

//Code to fill meet names 

function fill_meet_name() {
    times[0][4] = "Meet";
    times[50][4] = "Blank";
    for (const i in meet_urls) {
        got(meet_urls[i]).then(response => {
            const $ = cheerio.load(response.body);
            let text = $('.meetName').text().trim();
            times[i][4] = text;
            console.table(times);
        });
    }
}


//Changes unusable meet URLS to usable URLS 
function make_good_urls() {
    for (i = 0; i < meet_urls.length; i++) {
        got(meet_urls[i]).then(response => {
            const $ = cheerio.load(response.body);
            let good_url = $('#ddResultsView').children().attr('').value;
            good_url = good_url.replace('formatted', 'raw');
           
        }).catch(err => {
            console.log(err);
        });
    }
}

Returns the line with the athlete's time (puts meet URL and placement together )
got(section1).then(response => {
    const $ = cheerio.load(response.body);
    $('#page').each(function (i) {
        var text = $(this).text().trim();
        var position1 = text.search('Boys 100 Meter');
        text = text.slice(position1, -1);
        var position2 =  text.indexOf("Boys", text.indexOf("Boys") + 1);
        text = text.slice(0, position2);
        text = text.split('\n')
        //at this point choose place + 4 for the line with the time and athlete

    });
});
*/