const mongoose = require('mongoose')

const baseQuestionSchema = new mongoose.Schema({
  type: String,
  question: {
    kind: String,
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.kind' }
  },
  correctAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'CorrectAnswer' }
})

const BaseQuestion = mongoose.model('BaseQuestion', baseQuestionSchema)

module.exports = BaseQuestion
