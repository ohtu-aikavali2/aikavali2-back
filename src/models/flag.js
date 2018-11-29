const mongoose = require('mongoose')

const flagSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: mongoose.Schema.Types.Date, default: Date.now }
})

const Flag = mongoose.model('Flag', flagSchema)

module.exports = Flag
