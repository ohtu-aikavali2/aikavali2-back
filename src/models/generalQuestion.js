const mongoose = require('mongoose')

const generalQuestionSchema = new mongoose.Schema({
  value: String,
  options: Array,
  selectCount: String
})

const GeneralQuestion = mongoose.model('GeneralQuestion', generalQuestionSchema)

module.exports = GeneralQuestion