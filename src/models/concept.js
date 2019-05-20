const mongoose = require('mongoose')

const conceptSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
  // vai courses: suhde moneen?
  // description: mongoose.Schema.Types.String
})

const Concept = mongoose.model('Concept', conceptSchema)

module.exports = Concept
