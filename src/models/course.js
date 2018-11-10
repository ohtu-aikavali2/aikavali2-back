const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
})

const Course = mongoose.model('Course', courseSchema)

module.exports = Course