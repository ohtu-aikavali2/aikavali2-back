const mongoose = require('mongoose')

const compileQuestionSchema = new mongoose.Schema({
  options: Array
})

const CompileQuestion = mongoose.model('CompileQuestion', compileQuestionSchema)

module.exports = CompileQuestion