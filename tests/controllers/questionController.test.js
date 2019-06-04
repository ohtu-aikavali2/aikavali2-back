const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const BaseQuestion = require('../../src/models/baseQuestion')
const PrintQuestion = require('../../src/models/printQuestion')
const CompileQuestion = require('../../src/models/compileQuestion')
const CorrectAnswer = require('../../src/models/correctAnswer')
const Answer = require('../../src/models/answer')
const User = require('../../src/models/user')
const RepetitionItem = require('../../src/models/repetitionItem')
const Group = require('../../src/models/group')
const Concept = require('../../src/models/concept')
const testUrl = `${apiUrl}/questions`

// A helper function to get specific type of
// questions
const getQuestionsOfType = async (type) => {
  switch (type) {
    case 'base': return await BaseQuestion.find({})
    case 'compile': return await CompileQuestion.find({})
    case 'print': return await PrintQuestion.find({})
    default: return []
  }
}

describe('question controller', () => {
  // We need to store the token so all
  // tests can use it if needed
  let token
  let testGroup

  beforeEach(async () => {
    // Remove all DB entities
    await BaseQuestion.deleteMany()
    await PrintQuestion.deleteMany()
    await CompileQuestion.deleteMany()
    await CorrectAnswer.deleteMany()
    await Answer.deleteMany()
    await User.deleteMany()
    await RepetitionItem.deleteMany()
    await Group.deleteMany()
    await Concept.deleteMany()

    // Create a group
    testGroup = new Group({ name: 'test' })
    await testGroup.save()

    const testConcepts = [new Concept({ name: 'for' }), new Concept({ name: 'if' })]

    // Create a CorrectAnswer
    const newCorrectAnswer1 = new CorrectAnswer({ value: 'test' })
    await newCorrectAnswer1.save()

    // Create a CorrectAnswer
    const newCorrectAnswer2 = new CorrectAnswer({ value: 'test' })
    await newCorrectAnswer2.save()

    // Create a PrintQuestion
    const options = ['a', 'b', 'c']
    const newPrintQuestion = new PrintQuestion({ value: 'test', options: options.concat('test'), type: 'print', groupId: testGroup._id })
    await newPrintQuestion.save()
    const q1 = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: newPrintQuestion._id },
      correctAnswer: newCorrectAnswer1._id,
      concepts: testConcepts
    })
    await q1.save()

    // Create a CompileQuestion
    const newCompileQuestion = new CompileQuestion({ options: options.concat('test') })
    await newCompileQuestion.save()
    const q2 = new BaseQuestion({
      type: 'compile',
      question: { kind: 'CompileQuestion', item: newCompileQuestion._id, type: 'compile', groupId: testGroup._id },
      correctAnswer: newCorrectAnswer2._id,
      concepts: testConcepts
    })
    await q2.save()

    // Generate a user and store the
    // received token'
    const user = new User({ _id: 1, administrator: true, username: 'test user' })
    await user.save()
    token = jwt.sign({ userId: user._id, administrator: user.administrator }, process.env.SECRET)
  })

  describe(testUrl, () => {
    test('GET', async () => {
      const response = await api
        .get(testUrl)
      expect(response.body.length).toBe(2)
    })
  })

  describe(`${testUrl}/:id`, () => {
    test('DELETE', async () => {
      jest.setTimeout(10000)
      // Get initial questions
      const preQuestions = await BaseQuestion.find({})
      expect(preQuestions.length).toBe(2)

      // Create 2 answers for the question that is
      // about to be deleted and 1 for another question
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[0].question.item._id, answer: 'test' })
        .set('Authorization', `bearer ${ token }`)
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[0].question.item._id, answer: 'test' })
        .set('Authorization', `bearer ${ token }`)
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[1].question.item._id, answer: 'test' })
        .set('Authorization', `bearer ${ token }`)

      // Delete the first questions
      let response = await api
        .delete(`${testUrl}/${preQuestions[0]._id}`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('deleted successfully!')

      // Since the first question is of type print, check that
      // there are no more questions of type print
      const printQuestions = await getQuestionsOfType('print')
      expect(printQuestions.length).toBe(0)

      // Check that all answers relating to the
      // removed question have been deleted
      const postAnswers = await Answer.find()
      expect(postAnswers.length).toBe(1)

      // Check that the answers which are linked to the
      // deleted question are removed from the user
      const user = await User.findOne()
      expect(user.answers.length).toBe(1)

      // Check that the correct answers thich are linked
      // to the deleted question are removed
      const correctAnswers = await CorrectAnswer.find()
      expect(correctAnswers.length).toBe(1)

      // Check that only 1 question has been removed
      const postQuestions = await BaseQuestion.find()
      expect(postQuestions.length).toBe(1)

      // Check validation
      response = await api
        .delete(`${testUrl}/${preQuestions[0]._id}`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('question not found')

      response = await api
        .delete(`${testUrl}/malformed`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('malformed id')
    })
  })

  describe(`${testUrl}/random`, () => {
    test('GET', async () => {
      // Check validation
      let response = await api
        .get(`${testUrl}/random`)
      expect(response.body.error).toBeDefined()

      // Check that question is received
      response = await api
        .get(`${testUrl}/random`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.item.options.length).toBe(4)
    })
  })

  describe(`${testUrl}`, () => {
    test('POST', async () => {
      let response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswer: 'a', options: 'WRONG!', type: 'print' })
      expect(response.body.error).toBeDefined()

      response = await api
        .post(`${testUrl}`)
        .send({})
      expect(response.status).toBe(422)
      expect(response.body.error).toBeDefined()

      const originalPrintQuestions = await getQuestionsOfType('print')
      await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswer: 'a', options: ['b', 'c', 'd'], groupId: testGroup._id, type: 'print', concepts: [(new Concept({ name: test }))] })
      const updatedPrintQuestions = await getQuestionsOfType('print')
      expect(updatedPrintQuestions.length).toBe(originalPrintQuestions.length + 1)

      response = await api
        .post(`${testUrl}`)
        .send({ correctAnswer: 'a', options: 'WRONG!' })
      expect(response.body.error).toBeDefined()

      response = await api
        .post(`${testUrl}`)
        .send({})
      expect(response.status).toBe(422)
      expect(response.body.error).toBeDefined()

      const originalCompileQuestions = await getQuestionsOfType('compile')
      await api
        .post(`${testUrl}`)
        .send({ correctAnswer: 'a', options: ['b', 'c', 'd'], groupId: testGroup._id, type: 'compile',  concepts: [(new Concept({ name: test }))] })
      const updatedCompileQuestions = await getQuestionsOfType('compile')
      expect(updatedCompileQuestions.length).toBe(originalCompileQuestions.length + 1)
    })
  })


  describe(`${testUrl}/answer`, () => {
    test('POST', async () => {
      const questions = await BaseQuestion.find({}).populate('question.item')

      // Check for validation
      let response = await api
        .post(`${testUrl}/answer`)
        .send({ id: '123', answer: 'test' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('malformed id')

      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('some params missing')

      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'test' })
      expect(response.status).toBe(401)
      expect(response.body.error).toBeDefined()

      /*       // Check for correct answer
      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'test' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.isCorrect).toBe(true)

      // Check for incorrect answer
      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'wrong' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.isCorrect).toBe(false)
      expect(response.body.correctAnswer).toBe('test')

      // Check that new answer entities are created
      const answers = await Answer.find()
      expect(answers.length).toBe(2)

      // Check that user has been linked to their answers
      const user = await User.findOne()
      expect(user.answers.length).toBe(2)


      // Check taht skipping questions works as intended
      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[1].question.item._id, answer: 'Note: questionSkipped' })
        .set('Authorization', `bearer ${ token }`)
      const repetitionItem = await RepetitionItem.findOne({ 'user': user._id, 'question': questions[1]._id })
      expect(repetitionItem.easinessFactor).toBe(1.7000000000000002)

      // Check no more questions left
      response = await api
        .get(`${testUrl}/random`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.message).toBeDefined() */
    })
  })
})

afterAll(() => {
  server.close()
})