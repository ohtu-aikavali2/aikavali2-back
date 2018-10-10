const mongoose = require('mongoose')

const repetitionItemSchema = new mongoose.Schema({
  nextDate: mongoose.Schema.Types.Number,
  easinessFactor: mongoose.Schema.Types.Number,
  interval: mongoose.Schema.Types.Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' }
})

const RepetitionItem = mongoose.model('RepetitionItem', repetitionItemSchema)

module.exports = RepetitionItem