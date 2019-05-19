const mongoose = require('mongoose');

const { Schema } = mongoose;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
  },
  byline: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
