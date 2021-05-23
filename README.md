# MileSplit-Ranks-Web-Scraper
A lightweight node.js web scraper to acquire, and then format the ranked list of runners for events listed in MileSplit. 

**Currently in-progress**

## Table of Contents 
- [MileSplit-Ranks-Web-Scraper](#milesplit-ranks-web-scraper)
- [Explanation of Function](#explanation-of-function)
- [Installation and Use](#installation-and-use)

## Explanation of Function 
If you've ever run XC or T&F at a non-professional level, your results were probably posted to [MileSplit](https://www.milesplit.com/), the "premier network for track & field and cross country." Essentially, they host all the results of various races and meets throughout the United States and publish them in a navigable format with specific meet results, results by athlete, results by event, and so on, available. Unfortunately, a good deal of use of MileSplit requires a paid subscription to MileSplit. 

This scraper aims to provide a similarily readable ranked list of athletes by gender/region/event without a subscription to MileSplit. These lists ican be helpful when determining advancement to future meets or if you're just curious! 

## Installation and Use

1. Download and install [node](https://nodejs.org/en/) 
2. Either download or clone the [repository](https://github.com/TheBlueness/MileSplit-Ranks-Web-Scraper)
3. `cd` into the downloaded/extracted folder 
4. Run `npm install` 
5. [Edit the URL](https://github.com/TheBlueness/MileSplit-Ranks-Web-Scraper/blob/8736c4c85ee81c3b3b6c18ff3a284a61643240d7/gatherBasicInfo.js#L3-L6) of the rank list you'd like to scrape and gain access to 
6. Run `node gatherBasicInfo.js`
7. [output not ready yet]
