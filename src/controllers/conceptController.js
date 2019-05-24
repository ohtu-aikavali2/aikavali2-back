// const jwt = require('jsonwebtoken')
// const mongoose = require('mongoose')
const conceptRouter = require('express').Router()
const Concept = require('../models/concept')

conceptRouter.get('/', async (req, res) => {
  try {
    console.log('1')
    const concepts = await Concept.find()
      .populate({ path: 'course', model: 'Course' })
      .populate('baseQuestions')
    console.log(concepts)
    res.status(200).json(concepts)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }

})

conceptRouter.post('/', async (req, res) => {
  try {
    const { name, course, baseQuestions } = req.body
    console.log(course)
    console.log(baseQuestions)
    const newConcept = new Concept({ name, course, baseQuestions })
    console.log(newConcept)
    await newConcept.save()

    res.status(201).json(newConcept)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})


module.exports = conceptRouter
