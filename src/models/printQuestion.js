const mongoose = require('mongoose')

const printQuestionSchema = new mongoose.Schema({
  value: String,
  options: Array
})

const PrintQuestion = mongoose.model('PrintQuestion', printQuestionSchema)

module.exports = PrintQuestion