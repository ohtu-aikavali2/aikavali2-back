const groupRouter = require('express').Router()
const Group = require('../models/group')
const Course = require('../models/course')

groupRouter.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
    res.status(200).json(groups)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

groupRouter.post('/', async (req, res) => {
  try {
    const { name, courseId } = req.body
    if (!(name && courseId)) {
      return res.status(422).json({ error: 'some params missing' })
    }
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: 'course not found' })
    }
    const newGroup = new Group({ name })
    await newGroup.save()
    course.groups = course.groups.concat(newGroup._id)
    await course.save()
    res.status(201).json(newGroup)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = groupRouter
