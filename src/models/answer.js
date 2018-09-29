const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isCorrect: mongoose.Schema.Types.Boolean
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer