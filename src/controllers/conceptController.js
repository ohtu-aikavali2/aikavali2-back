// const jwt = require('jsonwebtoken')
// const mongoose = require('mongoose')
const conceptRouter = require('express').Router()
const Concept = require('../models/concept')

// conceptRouter.get('/', async (req, res) => {
//   try {
//     const baseQuestions = await BaseQuestion.find()
//       .populate('question.item')
//       .populate({ path: 'group', populate: { path: 'course', model: 'Course' }, model: 'Group' })
//       .populate('correctAnswer')
//     res.status(200).json(baseQuestions)
//   } catch (e) {
//     console.error('e', e)
//     res.status(500).json({ error: e.message })
//   }
// })

// conceptRouter.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params
//     const { token } = req.body
//     // Verify user rights
//     if (!token) {
//       return res.status(401).json({ error: 'token missing' })
//     }
//     const { userId } = jwt.verify(token, process.env.SECRET)
//     const foundUser = await User.findById(userId)
//     if (!foundUser.administrator) {
//       return res.status(403).json({ error: 'Unauthorized' })
//     }

//     // Validate id
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'malformed id' })
//     }

//     // Find the target base question
//     const baseQuestion = await BaseQuestion.findById(id)

//     if (!baseQuestion) {
//       return res.status(404).json({ error: 'question not found' })
//     }

//     // Remove the question that the base question includes
//     if (baseQuestion.type === 'compile') {
//       await CompileQuestion.findByIdAndRemove(baseQuestion.question.item)
//     } else {
//       await PrintQuestion.findByIdAndRemove(baseQuestion.question.item)
//     }

//     // Remove the correct answer that the found question includes
//     await CorrectAnswer.findByIdAndRemove(baseQuestion.correctAnswer)

//     // Remove the link between users and the answers that are about to
//     // be deleted. Array.forEach loop can't be used because it doesn't work
//     // as intended with async calls.
//     const answers = await Answer.find({ 'question': id })
//     for (let i = 0; i < answers.length; i++) {
//       const answer = answers[i]
//       const user = await User.findById(answer.user)
//       if (!user) {
//         continue
//       }
//       user.answers = user.answers.filter((id) => !id.equals(answer._id))
//       await user.save()
//     }

//     // Remove all found question reviews
//     await QuestionReview.deleteMany({ 'question': id })

//     // Remove all found flags
//     await Flag.deleteMany({ 'question': id })

//     // Remove all found answer entities
//     await Answer.deleteMany({ 'question': id })

//     // Remove all repetition items that are linked to the question
//     await RepetitionItem.deleteMany({ 'question': id })

//     // Remove the base question
//     await BaseQuestion.findByIdAndRemove(id)

//     res.status(200).json({ message: 'deleted successfully!' })
//   } catch (e) {
//     console.error('e', e)
//     res.status(500).json({ error: e.message })
//   }
// })

conceptRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      course
    } = req.body

    // Verify user rights

    // Validate parameters

    // Find and validate the given course

    // Create a new concept entity and save it
    const concept = new Concept({ name, course })
    await concept.save()

    res.status(201).json(concept)
  } catch (e) {
    console.error('e', e)
    res.status(500).json({ error: e.message })
  }
})

// // "Restore" questions (make them available again)
// conceptRouter.put('/restore', async (req, res) => {
//   try {
//     // Checks for token
//     const { token, questionIDs } = req.body
//     if (!token) {
//       return res.status(422).json({ error: 'Missing token!' })
//     }
//     const { userId } = jwt.verify(token, process.env.SECRET)
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ error: 'Invalid token!' })
//     }

//     if (!user.administrator) {
//       return res.status(403).json({ error: 'Unauthorized' })
//     }

//     if (questionIDs.length === 0) {
//       return res.status(422).json({ error: 'Missing questionsIDs!' })
//     }
//     for (let i = 0; i < questionIDs.length; i++) {
//       if (!mongoose.Types.ObjectId.isValid(questionIDs[i])) {
//         console.log('väärän tyyppinen id')
//         continue
//       }
//       const question = await BaseQuestion.findById(questionIDs[i])
//       if (!question) {
//         console.log('COULD NOT FIND THE QUESTION')
//         continue
//       }
//       question.deleted = false
//       await question.save()
//     }
//     res.status(204).end()
//   } catch (e) {
//     console.error('e', e)
//     res.status(500).json({ error: e.message })
//   }
// })

// // Returns all the "Deleted" questions
// conceptRouter.get('/deleted', async (req, res) => {
//   try {
//     const deletedQuestions = await BaseQuestion.find({ deleted: true })
//       .populate('question.item')
//       .populate({ path: 'group', populate: { path: 'course', model: 'Course' }, model: 'Group' })
//       .populate('correctAnswer')
//     res.status(200).json(deletedQuestions)
//   } catch (e) {
//     console.error('e', e)
//     res.status(500).json({ error: e.message })
//   }
// })

// // Returns all the questions which have not been deleted
// conceptRouter.get('/available', async (req, res) => {
//   try {
//     const baseQuestions = await BaseQuestion.find({ deleted: { $ne: true } })
//       .populate('question.item')
//       .populate({ path: 'group', populate: { path: 'course', model: 'Course' }, model: 'Group' })
//       .populate('correctAnswer')
//     res.status(200).json(baseQuestions)
//   } catch (e) {
//     console.error('e', e)
//     res.status(500).json({ error: e.message })
//   }
// })

module.exports = conceptRouter
