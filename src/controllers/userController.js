const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/generate', async (req, res) => {
  try {
    // Create new user entity and save it
    const newUser = new User({ questions: [], answers: [] })
    await newUser.save()
    // Create and return a new token for the user
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET)
    res.status(201).json({ id: newUser._id, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

userRouter.get('/verifyToken', async (req, res) => {
  try {
    const token = req.body.token
    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }
    // Verify token. If the token is invalid, then the following
    // line will throw an error.
    jwt.verify(token, process.env.SECRET)
    res.status(200).json({ message: 'Token verified!' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'There was something wrong with the token!' })
  }
})

module.exports = userRouter