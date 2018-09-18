const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' }]
})

const User = mongoose.model('User', userSchema)

module.exports = User