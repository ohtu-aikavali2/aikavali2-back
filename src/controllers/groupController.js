const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const groupRouter = require('express').Router()
const Group = require('../models/group')
const Course = require('../models/course')
const User = require('../models/user')

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
    const { name, courseId, token } = req.body
    // Verify user rights
    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }
    if (!(name && courseId)) {
      return res.status(422).json({ error: 'some params missing' })
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'malformed course id' })
    }

    const { userId } = jwt.verify(token, process.env.SECRET)
    const foundUser = await User.findById(userId)
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: 'course not found' })
    }

    if (!foundUser.administrator && course.user !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const newGroup = new Group({ name, course: course._id })
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
