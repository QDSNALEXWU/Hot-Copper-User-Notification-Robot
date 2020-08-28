require('dotenv').config();
const crawler = require('./crawler');
const emailer = require('./emailer');
var schedule = require('node-schedule-tz');

async function run() {
    
    // run at 6 am every day 
    schedule.scheduleJob('send at morning', '0 0 6 * * *', 'Australia/Melbourne', async function(){
        const posts = await crawler.getNewPosts();
        emailer.sendEmailByGmail(posts);
    });

    // run at 6 pm every day 
    schedule.scheduleJob('send at evening', '0 0 18 * * *', 'Australia/Melbourne', async function(){
        const posts = await crawler.getNewPosts();
        emailer.sendEmailByGmail(posts);
    });
}

run();