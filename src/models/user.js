const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.Number,
  administrator: mongoose.Schema.Types.Boolean,
  username: mongoose.Schema.Types.String,
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  hasSeenIntro: { type: mongoose.Schema.Types.Boolean, default: false }
})

const User = mongoose.model('User', userSchema)

module.exports = User