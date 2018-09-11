const mongoose = require('mongoose')

const compileQuestionSchema = new mongoose.Schema({
  correctAnswer: String,
  wrongAnswers: Array
})

const CompileQuestion = mongoose.model('CompileQuestion', compileQuestionSchema)

module.exports = CompileQuestion