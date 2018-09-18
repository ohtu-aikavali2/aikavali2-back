const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/generate', async (req, res) => {
  try {
    const newUser = new User()
    await newUser.save()
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET)
    res.status(201).json({ token })
  } catch (e) {
    console.error(e)
    res.status(500)
  }
})

userRouter.get('/verifyToken', async (req, res) => {
  try {
    const token = req.body.token
    const verifiedToken = jwt.verify(token, process.env.SECRET)
    console.log('verified', verifiedToken)
    res.status(200).json({ message: 'Token verified!' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'There was something wrong with the token!' })
  }
})

module.exports = userRouter