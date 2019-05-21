const mongoose = require('mongoose')

const baseQuestionSchema = new mongoose.Schema({
  type: String,
  question: {
    kind: String,
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.kind' }
  },
  correctAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'CorrectAnswer' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  flags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flag' }],
  recentFlag: { type: mongoose.Schema.Types.Date, default: null },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionReview' }],
  reviewSum: { type: mongoose.Schema.Types.Number, default: 0 },
  averageRating: { type: mongoose.Schema.Types.Number, default: 0 },
  deleted: { type: mongoose.Schema.Types.Boolean, default: false },
  concepts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concept' }]
})

const BaseQuestion = mongoose.model('BaseQuestion', baseQuestionSchema)

module.exports = BaseQuestion
