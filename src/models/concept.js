const mongoose = require('mongoose')

const conceptSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

const Concept = mongoose.model('Concept', conceptSchema)

module.exports = Concept
