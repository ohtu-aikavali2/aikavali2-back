const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
})

const User = mongoose.model('User', userSchema)

module.exports = User