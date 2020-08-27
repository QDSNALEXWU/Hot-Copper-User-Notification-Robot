const scrapy = require('node-scrapy');
const fetch = require('node-fetch');
var moment = require('moment');

/**
 * Constantspwd
 */

const postListModel = {
    posts: [
        'tr',
        {
          url: '.title-td > a (href)',
          date: '.stats-td:last-child',
        },
    ],
}

const postDetailModel = {
    title: '.thread-title',
    author: '.user-username',
}

/**
 * Gnerate the list of urls to crawl
 */
function gernerateUrls() {
    let urls = []
    let targets = process.env.TARGETS.split(',');
    urls = targets.map(i => (`https://hotcopper.com.au/search/1/?q=${i}&t=post&o=date&c[visible]=true`));
    return urls
}


/**
 * Parsing the post table page
 * @param {*} url 
 */
function fetchPostList(url) {
    return fetch(url)
    .then((res) => res.text())
    .then((body) => {
        return scrapy.extract(body, postListModel);
    }).catch(console.error);
}

/**
 * Parsing the post detail page
 * @param {*} url 
 */
function fetchPostDetail (url) {
    return fetch(url)
    .then((res) => res.text())
    .then((body) => {
        return scrapy.extract(body, postDetailModel);
    }).catch(console.error);
}

/**
 * Run the crawler
 */
async function getNewPosts() {
    let newPosts = [];
    //const urls = gernerateUrls();
    const urls = [process.env.URL];

    // fetch post table pages to get list of new adds
    for (let url of urls) {
        let result = await fetchPostList(url);
        if(!result.posts) continue;
        let today = moment();
        let validPosts = result.posts.filter(post => {
                if(!post.date || !post.url) return false;
                let date = post.date.includes(':') ? moment(post.date, 'hh:mm') : moment(post.date, 'DD/MM/YY');
                let diff = today.diff(date, 'hours');
                return diff <= parseInt(process.env.INTERVAL);
            }
        )
        newPosts = [...newPosts, ...validPosts];
    }
    
    let results = [];
    // get detailed info of each post 
    for(let post of newPosts) {
        let url = 'https://hotcopper.com.au' + post.url;
        let data = await fetchPostDetail(url);
        data.title = data.title.trim();
        data.author = data.author.trim();
        data.url = url;
        data.time = post.date;
        results.push(data);
    }
    return results;
}

module.exports = {
    getNewPosts
};
 