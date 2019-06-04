const mongoose = require('mongoose')

const correctAnswerSchema = new mongoose.Schema({
  value: Array
})

const CorrectAnswer = mongoose.model('CorrectAnswer', correctAnswerSchema)

module.exports = CorrectAnswer