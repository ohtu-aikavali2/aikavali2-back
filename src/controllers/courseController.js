const courseRouter = require('express').Router()
const Course = require('../models/course')

courseRouter.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
    res.status(200).json(courses)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

courseRouter.get('/:name', async (req, res) => {
  try {
    const { name } = req.params
    const course = await Course.findOne({ name }).populate('groups')
    if (!course) {
      return res.status(404).json({ error: 'course not found' })
    }
    res.status(200).json(course)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

courseRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(422).json({ error: 'course name missing' })
    }
    const newCourse = new Course({ name })
    await newCourse.save()
    res.status(201).json(newCourse)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = courseRouter
