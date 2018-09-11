const questionRouter = require('express').Router()
const BaseQuestion = require('../models/baseQuestion')
const PrintQuestion = require('../models/printQuestion')
const CompileQuestion = require('../models/compileQuestion')

questionRouter.get('/', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item')
    res.status(200).json(baseQuestions)
  } catch (e) {
    console.error('e', e)
    res.status(500)
  }
})

questionRouter.get('/random', async (req, res) => {
  try {
    const baseQuestions = await BaseQuestion.find().populate('question.item')
    const question = baseQuestions[Math.floor(Math.random() * (baseQuestions.length))]
    res.status(200).json(BaseQuestion.format(question))
  } catch (e) {
    console.error('e', e)
    res.status(500)
  }
})

questionRouter.post('/print', async (req, res) => {
  try {
    const { value, correctAnswer, wrongAnswers } = req.body
    const newPrintQuestion = new PrintQuestion({ value, correctAnswer, wrongAnswers })
    await newPrintQuestion.save()
    const newBaseQuestion = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: newPrintQuestion._id }
    })
    const result = await newBaseQuestion.save()
    res.status(201).json(result)
  } catch (e) {
    console.error('e', e)
    res.status(500)
  }
})

questionRouter.post('/compile', async (req, res) => {
  try {
    const { correctAnswer, wrongAnswers } = req.body
    const newCompileQuestion = new CompileQuestion({ correctAnswer, wrongAnswers })
    await newCompileQuestion.save()
    const newBaseQuestion = new BaseQuestion({
      type: 'compile',
      question: { kind: 'CompileQuestion', item: newCompileQuestion._id }
    })
    const result = await newBaseQuestion.save()
    res.status(201).json(result)
  } catch (e) {
    console.error('e', e)
    res.status(500)
  }
})

module.exports = questionRouter