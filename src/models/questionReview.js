const mongoose = require('mongoose')

const questionReviewSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' },
  review: { type: mongoose.Schema.Types.Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

const QuestionReview = mongoose.model('QuestionReview', questionReviewSchema)

module.exports = QuestionReview
