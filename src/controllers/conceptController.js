// const jwt = require('jsonwebtoken')
// const mongoose = require('mongoose')
const conceptRouter = require('express').Router()
const Concept = require('../models/concept')

conceptRouter.get('/', async (req, res) => {
  try {
    const concepts = await Concept.find()
      .populate({ path: 'course', model: 'Course' })
    res.status(200).json(concepts)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }

})

conceptRouter.post('/', async (req, res) => {
  try {
    const { name, course } = req.body
    const newConcept = new Concept({ name, course })

    // Check that name is included and not empty
    if (!name || name === '') {
      return res.status(422).json({ error: 'params missing' })
    }

    await newConcept.save()

    res.status(201).json(newConcept)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})


module.exports = conceptRouter
