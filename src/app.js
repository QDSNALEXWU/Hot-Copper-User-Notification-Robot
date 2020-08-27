require('dotenv').config();
const crawler = require('./crawler');
const emailer = require('./emailer');
const schedule = require('node-schedule');

async function run() {
    
    // run at 6 am every day 
    schedule.scheduleJob('* * 6 * * *', async function(){
        const posts = await crawler.getNewPosts();
        emailer.sendEmailByGmail(posts);
    });

    // run at 6 pm every day 
    schedule.scheduleJob('* * 18 * * *', async function(){
        const posts = await crawler.getNewPosts();
        emailer.sendEmailByGmail(posts);
    });

}

run();