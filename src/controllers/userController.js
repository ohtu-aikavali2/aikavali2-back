const jwt = require('jsonwebtoken')
const axios = require('axios')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/login', async (req, res) => {
  try {
    const { user } = req.body

    // Validate auth in tmc server. Server returns
    // some data regarding the user.
    const authUrl = 'https://tmc.mooc.fi/api/v8/users/current'
    const { data } = await axios.get(authUrl, { headers: { 'Authorization': `bearer ${user.accessToken}` } })
    if (data.errors) {
      return res.status(500).json({ error: 'TMC error' })
    }

    // Check if user has logged in previously
    let foundUser = await User.findById(data.id)
    if (!foundUser) {
      // If this is the first login for this specific user, create
      // a new user entity
      foundUser = new User({ answers: [], _id: data.id, administrator: data.administrator, username: data.username })
      await foundUser.save()
    }

    // Create token
    const token = jwt.sign({ userId: foundUser._id }, process.env.SECRET)

    res.status(200).json({ id: foundUser._id, username: foundUser.username, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login error' })
  }
})

userRouter.post('/generate', async (req, res) => {
  try {
    // Create new user entity and save it
    const _id = Math.floor(Math.random() * 999999)
    const newUser = new User({ answers: [], _id })
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