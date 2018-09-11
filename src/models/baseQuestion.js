const mongoose = require('mongoose')

const baseQuestionSchema = new mongoose.Schema({
  type: String,
  question: {
    kind: String,
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.kind' }
  }
})

baseQuestionSchema.statics.format = (baseQuestion) => {
  return {
    _id: baseQuestion._id,
    type: baseQuestion.type,
    question: baseQuestion.question.item
  }
}

const BaseQuestion = mongoose.model('BaseQuestion', baseQuestionSchema)

module.exports = BaseQuestion