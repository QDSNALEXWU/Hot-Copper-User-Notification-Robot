require('dotenv').config();
const crawler = require('./crawler');
const emailer = require('./emailer');

async function run() {
    const posts = await crawler.getNewPosts();
    emailer.sendTestEmail(posts);
}

run();