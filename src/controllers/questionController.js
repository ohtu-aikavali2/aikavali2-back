const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const questionRouter = require('express').Router()
const BaseQuestion = require('../models/baseQuestion')
const PrintQuestion = require('../models/printQuestion')
const CompileQuestion = require('../models/compileQuestion')
const CorrectAnswer = require('../models/correctAnswer')
const User = require('../models/user')
const Answer = require('../models/answer')

questionRouter.get('/', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item').populate('correctAnswer')
    res.status(200).json(baseQuestions)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.delete('/:id', async (req, res) => {
  try {
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'malformed id' })
    }

    // Find the target base question
    const baseQuestion = await BaseQuestion.findById(req.params.id)

    if (!baseQuestion) {
      return res.status(404).json({ error: 'question not found' })
    }

    // Remove the question that the base question includes
    if (baseQuestion.type === 'compile') {
      await CompileQuestion.findByIdAndRemove(baseQuestion.question.item)
    } else {
      await PrintQuestion.findByIdAndRemove(baseQuestion.question.item)
    }

    // Remove the correct answer that the found question includes
    await CorrectAnswer.findByIdAndRemove(baseQuestion.correctAnswer)

    // Remove the link between users and the answers that are about to
    // be deleted. Array.forEach loop can't be used because it doesn't work
    // as intended with async calls.
    const answers = await Answer.find({ 'question': req.params.id })
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i]
      const user = await User.findById(answer.user)
      user.answers = user.answers.filter((id) => !id.equals(answer._id))
      await user.save()
    }

    // Remove all found answer entities
    await Answer.deleteMany({ 'question': req.params.id })

    // Remove the base question
    await BaseQuestion.findByIdAndRemove(req.params.id)

    res.status(200).json({ message: 'deleted successfully!' })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.get('/random', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item')
    // Returns a random question from the database
    const baseQuestion = baseQuestions[Math.floor(Math.random() * (baseQuestions.length))]
    res.status(200).json(baseQuestion.question)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.post('/print', async (req, res) => {
  try {
    // Validate given parameters
    const { value, correctAnswer, options } = req.body
    if (!(value && correctAnswer && options)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!Array.isArray(options)) {
      return res.status(401).json({ error: 'options should be of type array' })
    } else if (options.length === 0) {
      return res.status(401).json({ error: 'there should be at least one option' })
    }

    // Create a new CorrectAnswer entity and save it
    const newCorrectAnswer = new CorrectAnswer({ value: correctAnswer })
    await newCorrectAnswer.save()

    // Create a new PrintQuestion entity and save it
    const newPrintQuestion = new PrintQuestion({ value, options: options.concat(correctAnswer) })
    await newPrintQuestion.save()

    // Create a new BaseQuestion entity with type 'print' and save it
    const newBaseQuestion = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: newPrintQuestion._id },
      correctAnswer: newCorrectAnswer._id
    })
    const result = await newBaseQuestion.save()
    res.status(201).json(result)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.post('/compile', async (req, res) => {
  try {
    // Validate given parameters
    const { correctAnswer, options } = req.body
    if (!(correctAnswer && options)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!Array.isArray(options)) {
      return res.status(401).json({ error: 'options should be of type array' })
    } else if (options.length === 0) {
      return res.status(401).json({ error: 'there should be at least one option' })
    }

    // Create a new CorrectAnswer entity and save it
    const newCorrectAnswer = new CorrectAnswer({ value: correctAnswer })
    await newCorrectAnswer.save()

    // Create a new CompileQuestion entity and save it
    const newCompileQuestion = new CompileQuestion({ options: options.concat(correctAnswer) })
    await newCompileQuestion.save()

    // Create a new BaseQuestion entity with type 'compile' and save it
    const newBaseQuestion = new BaseQuestion({
      type: 'compile',
      question: { kind: 'CompileQuestion', item: newCompileQuestion._id },
      correctAnswer: newCorrectAnswer._id
    })
    const result = await newBaseQuestion.save()
    res.status(201).json(result)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.post('/answer', async (req, res) => {
  try {
    // Validate given parameters
    const { id, answer, token } = req.body

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'malformed id' })
    }

    if (!answer) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }

    // Validate user
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    // Find the BaseQuestion entity that contains the answered question
    const answeredQuestion = await BaseQuestion.findOne({ 'question.item': id }).populate('correctAnswer')

    // Check if the received answer is correct
    const isCorrect = answer === answeredQuestion.correctAnswer.value

    // Create a new Answer entity and save it
    const userAnswer = new Answer({ question: answeredQuestion._id, user: userId, isCorrect })
    await userAnswer.save()

    // Link the answer to the User entity and save it
    user.answers = user.answers.concat(userAnswer._id)
    await user.save()

    // If the received answer was wrong, the response will contain the correct answer as well
    res.status(200).json({ isCorrect, ...(!isCorrect && { correctAnswer: answeredQuestion.correctAnswer.value }) })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = questionRouter