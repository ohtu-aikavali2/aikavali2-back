const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const questionReviewRouter = require('express').Router()
const User = require('../models/user.js')
const BaseQuestion = require('../models/baseQuestion.js')
const QuestionReview = require('../models/questionReview.js')

questionReviewRouter.post('/', async (req, res) => {
  try {
    const { review, questionId, token } = req.body
    // see if params are missing
    if (!(review && questionId && token)) {
      return res.status(422).json({ error: 'Some params missing' })
    }

    // validate id
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: 'malformed id' })
    }

    // validate user
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    // const relatedQuestion = await BaseQuestion.findOne({ 'question.item': questionId }).populate('correctAnswer')
    const question = await BaseQuestion.findById(questionId)
    if (!question) {
      return res.status(404).json({ error: 'basequestion not found' })
    }
    const questionReview = new QuestionReview({ question: questionId, review: review, user })
    const savedQuestionReview = await questionReview.save()
    let reviews = question.reviews.concat(savedQuestionReview._id)
    question.reviews = reviews
    // Lasketaan average-rating
    let sum = Number(question.reviewSum) + Number(review)
    question.reviewSum = sum
    question.averageRating = sum / reviews.length
    await question.save()
    return res.status(201).json({ message: 'Review submitted successfully' })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

// All the reviews
questionReviewRouter.get('/', async (req, res) => {
  try {
    const reviews = await QuestionReview.find().populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(reviews)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Reviews by questionID
questionReviewRouter.get('/question/:id', async (req, res) => {
  try {
    const questionID = req.params.id
    const reviews = await QuestionReview.find({ question: questionID }).populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(reviews)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Review by reviewID
questionReviewRouter.get('/:id', async (req, res) => {
  try {
    const reviewID = req.params.id
    const review = await QuestionReview.findById(reviewID).populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(review)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Delete review
questionReviewRouter.delete('/:id', async (req, res) => {
  try {
    const { token } = req.body
    // Verify user rights
    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user.administrator) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const reviewID = req.params.id
    if (reviewID === 'all') {
      await QuestionReview.remove({})
      // Also remove every review in the BaseQuestion Models
      const questions = await BaseQuestion.find()
      for (let i = 0; i < questions.length; i++) {
        questions[i].reviews = questions[i].reviews.filter(id => id === null)
        questions[i].reviewSum = 0
        questions[i].averageRating = 0
        await questions[i].save()
      }
      return res.status(204).end()
    }
    const reviewToBeDeleted = await QuestionReview.findById(reviewID)
    if (!reviewToBeDeleted) {
      return res.status(404).json({ error: 'Not found!' })
    }
    await QuestionReview.findByIdAndRemove(reviewID)
    // Also delete from BaseQuestions
    const question = await BaseQuestion.findById(reviewToBeDeleted.question)
    question.reviews = question.reviews.filter(id => String(id) !== String(reviewID))
    // Recalculate the average rating and sum
    if (question.reviews.length <= 0) {
      question.reviewSum = 0
      question.averageRating = 0
    } else {
      question.reviewSum = Number(question.reviewSum) - Number(reviewToBeDeleted.review)
      if (question.reviewSum < 0) {
        question.reviewSum = 0
      }
      question.averageRating = question.reviewSum / question.reviews.length
    }
    await question.save()
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = questionReviewRouter
