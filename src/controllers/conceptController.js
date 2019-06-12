// const mongoose = require('mongoose')
const conceptRouter = require('express').Router()
const Concept = require('../models/concept')
const Course = require('../models/course')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

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
    const { name, course, token } = req.body
    const { userId } = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(userId)

    if(!user) {
      return res.status(404).json({ error: 'Invalid token!' })
    }
    // Check that name is included and not empty
    if (!name || name === '') {
      return res.status(422).json({ error: 'params missing' })
    }

    const newConcept = new Concept({ name, course, user })

    await newConcept.save()

    res.status(201).json(newConcept)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

conceptRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { token } = req.body

    console.log('poistetaan', id)
    //Verify user rights
    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }

    //Validate that admin is deleting
    const { userId } = jwt.verify(token, process.env.SECRET)
    const foundUser = await User.findById(userId)
    if (!foundUser.administrator) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    //Find the concept to be deleted 
    const concept = await Concept.findById(id)

    const course = await Course.findById(concept.course)
    console.log('ennen',course.concepts)
    course.concepts = course.concepts.filter( conceptId => !conceptId.equals(id) )
    console.log('jälkeen', course.concepts)

    await course.save()
    
    await Concept.findByIdAndRemove(id)

    res.status(200).json({ message: 'deleted successfully!' })
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = conceptRouter
