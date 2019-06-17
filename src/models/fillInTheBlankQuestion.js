const mongoose = require('mongoose')

const fillInTheBlankQuestionSchema = new mongoose.Schema({
  value: String,
})

const FillInTheBlankQuestion = mongoose.model('FillInTheBlankQuestion', fillInTheBlankQuestionSchema)

module.exports = FillInTheBlankQuestion