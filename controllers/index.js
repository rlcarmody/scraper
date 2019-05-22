/* eslint-disable no-underscore-dangle */
const cheerio = require('cheerio');
const axios = require('axios');
const db = require('../models');


const getUserName = (cookies) => {
  if (cookies.id) {
    return db.User.findOne({ _id: cookies.id }).exec();
  }
  const user = new db.User();
  user.save();
  return user;
};

const scrapeArticles = () => {
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
      return articles;
    });
};

module.exports = (app) => {
  app.get('/', async (req, res) => {
    const user = await getUserName(req.cookies);

    res.cookie('id', user._id, { maxAge: 31556952000 });

    const articles = scrapeArticles();

    db.Article.insertMany(articles, { ordered: false }, () => {
      db.Article.find({}).sort({ _id: -1 }).limit(5).then((results) => {
        res.render('articles', { articles: results, user });
      });
    });
  });

  app.post('/comment', async (req, res) => {
    const user = await getUserName(req.cookies);
    const commentText = req.body.comment;
    const comment = new db.Comment({ text: commentText });
    user.comments.push(comment._id);
    user.save();
    comment.save();
    res.json({ id: comment._id });
  });
};
