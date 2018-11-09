const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  baseQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BaseQuestion' }]
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group