const scrapy = require('node-scrapy');
const fetch = require('node-fetch');
var moment = require('moment');

/**
 * Constants
 */

const INTERVAL = 24;

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
async function run() {
    let newPosts = [];
    const urls = ['https://hotcopper.com.au/search/20352998/?q=%2A&t=post&o=relevance&c%5Bvisible%5D=true&c%5Buser%5D%5B0%5D=576113']
    
    // fetch post table pages to get list of new adds
    for (let url of urls) {
        let result = await fetchPostList(url);
        let today = moment();
        let validPosts = result.posts.filter(post => {
                if(!post.date || !post.url) return false;
                let date = post.date.includes(':') ? moment(post.date, 'hh:mm') : moment(post.date, 'DD/MM/YY');
                let diff = today.diff(date, 'hours');
                return diff <= INTERVAL;
            }
        )
        newPosts = [...newPosts, ...validPosts];
    }
    
    for(let post of newPosts) {
        let url = 'https://hotcopper.com.au' + post.url;
        let data = await fetchPostDetail(url);
        data.title = data.title.trim();
        data.author = data.author.trim();
        data.url = url;
        console.log(data);
    }
    // get detailed info of each post 
}

run();
 