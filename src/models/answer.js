const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' },
  user: { type: mongoose.Schema.Types.Number, ref: 'User' },
  isCorrect: mongoose.Schema.Types.Boolean,
  timestamp : { type : mongoose.Schema.Types.Date, default: Date.now },
  time: mongoose.Schema.Types.Number
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer