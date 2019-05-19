const cheerio = require('cheerio');
const axios = require('axios');
const db = require('../models');

module.exports = (app) => {
  app.get('/', (req, res) => {
    axios.get('https://www.anandtech.com')
      .then((response) => {
        const $ = cheerio.load(response.data);
        const articles = [];
        $('.cont_box1').each((i, elem) => {
          const headline = $(elem)
            .children('.cont_box1_txt')
            .children('h2')
            .children('a');

          const summary = $(elem)
            .children('.cont_box1_txt')
            .children('p')
            .text();

          const byline = $(elem)
            .children('.cont_box1_txt')
            .children('span')
            .children('a')
            .text();

          const title = headline.text();
          const url = `https://www.anandtech.com/${headline.attr('href')}`;

          const imageURL = $(elem)
            .children('.cont_box1_pic')
            .children('a')
            .children('img')
            .attr('src');

          const article = {
            title, byline, imageURL, url, summary,
          };
          articles.push(article);
        });
        db.Article.insertMany(articles, { ordered: false }, (err, docs) => {
          db.Article.find({}).then((results) => {
            res.render('articles', { articles: results });
          });
        });
      });
  });
};
