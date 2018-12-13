const flagRouter = require('express').Router()
const Flag = require('../models/flag')
const BaseQuestion = require('../models/baseQuestion')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const mongoose = require('mongoose')

flagRouter.post('/', async (req, res) => {
  try {
    const { questionID, token } = req.body
    if (!token) {
      return res.status(422).json({ error: 'Missing token!' })
    }
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Invalid token!' })
    }
    if (!mongoose.Types.ObjectId.isValid(questionID)) {
      return res.status(400).json({ error: 'Question ID malformed!' })
    }
    // Etsitään questionID:ta vastaava kysymys
    const question = await BaseQuestion.findById(questionID)
    if (!question) {
      return res.status(404).json({ error: 'No question found!' })
    }

    // Jos kysymys ja käyttäjä löytyneet, lisätään
    const flag = new Flag({
      question: questionID,
      user
    })
    const savedFlag = await flag.save()
    // Lisätään myös BaseQuestionin flags kenttään
    question.flags = question.flags.concat(savedFlag._id)
    question.recentFlag = savedFlag.timestamp
    await question.save()

    return res.status(201).json(savedFlag)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// All the flags
flagRouter.get('/', async (req, res) => {
  try {
    const flags = await Flag.find().populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(flags)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Flags by questionID
flagRouter.get('/question/:id', async (req, res) => {
  try {
    const questionID = req.params.id
    const flags = await Flag.find({ question: questionID }).populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(flags)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Flag by flagID
flagRouter.get('/:id', async (req, res) => {
  try {
    const flagID = req.params.id
    const flag = await Flag.findById(flagID).populate([
      {
        path: 'question',
        model: 'BaseQuestion'
      },
      {
        path: 'user',
        model: 'User'
      }
    ])
    res.status(200).json(flag)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Delete flag
flagRouter.delete('/:id', async (req, res) => {
  try {
    // Checks for token
    const { token } = req.body
    if (!token) {
      return res.status(422).json({ error: 'Missing token!' })
    }
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Invalid token!' })
    }

    const flagID = req.params.id
    if (flagID === 'all') {
      await Flag.remove({})
      // Also remove every flag in the BaseQuestion Models
      const questions = await BaseQuestion.find()
      for (let i = 0; i < questions.length; i++) {
        questions[i].flags = questions[i].flags.filter(id => id === null)
        questions[i].recentFlag = null
        await questions[i].save()
      }
      return res.status(204).end()
    }
    const flagToBeDeleted = await Flag.findById(flagID)
    if (!flagToBeDeleted) {
      return res.status(404).json({ error: 'Not found!' })
    }
    await Flag.findByIdAndRemove(flagID)
    // Also delete from BaseQuestions
    const question = await BaseQuestion.findById(flagToBeDeleted.question)
    question.flags = question.flags.filter(id => String(id) !== String(flagID))
    if (question.flags.length === 0) {
      question.recentFlag = null
    } else {
      let recentFlagID = question.flags[question.flags.length - 1]
      const recentFlagObject = await Flag.findById(recentFlagID)
      question.recentFlag = recentFlagObject.timestamp
    }
    await question.save()
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Delete multiple by given questionIDs
flagRouter.put('/', async (req, res) => {
  try {
    // Checks for token
    const { token, questionIDs } = req.body
    if (!token) {
      return res.status(422).json({ error: 'Missing token!' })
    }
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Invalid token!' })
    }

    if (questionIDs.length === 0) {
      return res.status(422).json({ error: 'Missing questionsIDs!' })
    }
    for (let i = 0; i < questionIDs.length; i++) {
      if (!mongoose.Types.ObjectId.isValid(questionIDs[i])) {
        console.log('väärän tyyppinen id')
        continue
      }
      const question = await BaseQuestion.findById(questionIDs[i])
      if (!question) {
        console.log('COULD NOT FIND THE QUESTION')
        continue
      }
      // Remove all the flags which have given questionID
      await Flag.deleteMany({ 'question': questionIDs[i] })
      // Empty the given question's flags field
      question.flags = question.flags.filter(id => id === null)
      question.recentFlag = null
      await question.save()
    }
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = flagRouter
