const mongoose = require('mongoose')
const answerRouter = require('express').Router()
const Answer = require('../models/answer')

answerRouter.get('/:userId', async (req, res) => {
  try {
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'malformed id' })
    }
    const userAnswers = await Answer.find({ user: req.params.userId })
    res.status(200).json(userAnswers)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = answerRouter