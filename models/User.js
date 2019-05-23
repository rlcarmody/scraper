const mongoose = require('mongoose');
const Sentencer = require('sentencer');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    default: Sentencer.make('{{ adjective }} {{ noun }}'),
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
