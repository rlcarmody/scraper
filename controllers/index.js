const db = require('../models');
const scrapeArticles = require('./scraper');
const santitizeHtml = require('sanitize-html');

const getUserName = cookies => {
  if (cookies.id) {
    return db.User.findOne({ _id: cookies.id }).exec();
  }
  const user = new db.User();
  user.save();
  return user;
};


module.exports = app => {
  app.get('/', async (req, res) => {
    const user = await getUserName(req.cookies);
    res.cookie('id', user._id, { maxAge: 31556952000, httpOnly: true });

    const articles = await scrapeArticles();

    db.Article.insertMany(articles, { ordered: false }, () => {
      db.Article.find({}).sort({ _id: -1 }).limit(5).then((results) => {
        res.render('articles', { articles: results, user, firstPage: true });
      });
    });
  });

  app.post('/comment', async (req, res) => {
    const user = await getUserName(req.cookies);
    const commentText = req.body.comment;
    const articleID = req.body.id;
    const comment = new db.Comment({ text: santitizeHtml(commentText), user: user.id });
    const response = {};
    response.commentID = comment._id;
    user.comments.push(comment._id);
    db.Article.findByIdAndUpdate(articleID, { $push: { comments: comment._id } }, (err, res) => {
      response.articleID = res._id;
    });
    user.save();
    comment.save()
      .then(doc => { res.json(doc) })
      .catch(err => res.status(400).end());

  });

  app.put('/updateUser', (req, res) => {
    const newUserName = santitizeHtml(req.body.userName);
    if (!newUserName) {
      return res.status(400).end();
    }
    db.User.findByIdAndUpdate(req.cookies.id, { $set: { username: newUserName } }, (err, doc) => {
      res.json({ message: 'success' });
    });
  });

  app.get('/view-comments/:id', async (req, res) => {
    const user = await getUserName(req.cookies);
    const id = req.params.id;
    db.Article.findById(id)
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' }
      })
      .then(article => {
        const { comments } = article;
        const sanitizedComments = comments.map(comment => {
          return {
            createdDate: comment.createdDate,
            text: comment.text,
            user: comment.user.username,
            id: comment.id,
            isCurrentUser: comment.user.id === user.id
          };
        });
        res.json(sanitizedComments);
      });
  });

  app.delete('/delete-comment/:id', async (req, res) => {
    const user = await getUserName(req.cookies);
    const id = req.params.id;
    db.Comment.findById(id, async (err, doc) => {
      if (err) {
        return res.status(500).end();
      }
      if (doc.user.equals(user._id)) {
        const deletedComment = await db.Comment.findByIdAndDelete(id);
        console.log(deletedComment);
        res.end();
      } else {
        res.status(401).end();
      }
    });
  });

  app.get('/:pgnumber', async (req, res) => {
    const user = await getUserName(req.cookies);
    res.cookie('id', user._id, { maxAge: 31556952000 });
    const pageNumber = parseInt(req.params.pgnumber, 10);
    const skip = (pageNumber - 1) * 5;

    db.Article.find({}).skip(skip).sort({ _id: -1 }).limit(5).then((results) => {
      res.render('articles', { articles: results, user, firstPage: pageNumber === 1, pageNumber });
    });
  });

};
