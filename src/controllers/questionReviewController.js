const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const questionReviewRouter = require('express').Router()
const User = require('../models/user.js')
const BaseQuestion = require('../models/baseQuestion.js')
const QuestionReview = require('../models/questionReview.js')

questionReviewRouter.post('/', async (req, res) => {
  try {
    const { review, questionId, token } = req.body
    //see if params are missing
    if (!(review && questionId && token)) {
      return res.status(422).json({ error: 'Some params missing' })
    }

    //validate id
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: 'malformed id' })
    }

    //validate user
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    const relatedQuestion = await BaseQuestion.findOne({ 'question.item': questionId }).populate('correctAnswer')
    if (!relatedQuestion) {
      return res.status(404).json({ error: 'basequestion not found' })
    }
    const questionReview = new QuestionReview({ question:questionId, review:review })
    await questionReview.save()

    return res.status(200).json({ message: 'Review submitted successfully' })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = questionReviewRouter
