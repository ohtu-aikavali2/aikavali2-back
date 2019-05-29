const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  imageSrc: mongoose.Schema.Types.String,
  description: mongoose.Schema.Types.String,
  concepts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concept' }]
})

const Course = mongoose.model('Course', courseSchema)

module.exports = Course