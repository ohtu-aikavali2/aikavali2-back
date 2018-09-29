const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' }],
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
})

const User = mongoose.model('User', userSchema)

module.exports = User