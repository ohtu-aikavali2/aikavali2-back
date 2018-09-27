const questionRouter = require('express').Router()
const BaseQuestion = require('../models/baseQuestion')
const PrintQuestion = require('../models/printQuestion')
const CompileQuestion = require('../models/compileQuestion')
const CorrectAnswer = require('../models/correctAnswer')

questionRouter.get('/', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item').populate('correctAnswer')
    res.status(200).json(baseQuestions)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.get('/random', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item')
    const baseQuestion = baseQuestions[Math.floor(Math.random() * (baseQuestions.length))]
    res.status(200).json(baseQuestion.question)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

questionRouter.post('/print', async (req, res) => {
  try {
    const { value, correctAnswer, options } = req.body
    if (!(value && correctAnswer && options)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!Array.isArray(options)) {
      return res.status(401).json({ error: 'options should be of type array' })
    } else if (options.length === 0) {
      return res.status(401).json({ error: 'there should be at least one option' })
    }
    const newCorrectAnswer = new CorrectAnswer({ value: correctAnswer })
    await newCorrectAnswer.save()
    const newPrintQuestion = new PrintQuestion({ value, options: options.concat(correctAnswer) })
    await newPrintQuestion.save()
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
    const { correctAnswer, options } = req.body
    if (!(correctAnswer && options)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!Array.isArray(options)) {
      return res.status(401).json({ error: 'options should be of type array' })
    } else if (options.length === 0) {
      return res.status(401).json({ error: 'there should be at least one option' })
    }
    const newCorrectAnswer = new CorrectAnswer({ value: correctAnswer })
    await newCorrectAnswer.save()
    const newCompileQuestion = new CompileQuestion({ options: options.concat(correctAnswer) })
    await newCompileQuestion.save()
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
    const { id, answer, token } = req.body
    if (!(id && answer)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }
    const answeredQuestion = await BaseQuestion.findOne({ 'question.item': id }).populate('correctAnswer')
    const isCorrect = answer === answeredQuestion.correctAnswer.value
    res.status(200).json({ isCorrect, ...(!isCorrect && { correctAnswer: answeredQuestion.correctAnswer.value }) })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = questionRouter