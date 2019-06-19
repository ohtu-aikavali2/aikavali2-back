const mongoose = require('mongoose')

const dragAndDropQuestionSchema = new mongoose.Schema({
  value: String,
  options: Array
})

const DragAndDropQuestion = mongoose.model('DragAndDropQuestion', dragAndDropQuestionSchema)

module.exports = DragAndDropQuestion