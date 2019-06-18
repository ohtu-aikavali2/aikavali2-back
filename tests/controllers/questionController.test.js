const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const BaseQuestion = require('../../src/models/baseQuestion')
const GeneralQuestion = require('../../src/models/generalQuestion')
const FillInTheBlankQuestion = require('../../src/models/fillInTheBlankQuestion')
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
    case 'general': return await GeneralQuestion.find({})
    case 'fillInTheBlank': return await FillInTheBlankQuestion.find({})
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
    await GeneralQuestion.deleteMany()
    await FillInTheBlankQuestion.deleteMany()
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
    const newCorrectAnswer1 = new CorrectAnswer({ value: ['test'] })
    await newCorrectAnswer1.save()

    // Create a CorrectAnswer
    const newCorrectAnswer2 = new CorrectAnswer({ value: ['correct1', 'correct2', 'correct3'] })
    await newCorrectAnswer2.save()

    const newCorrectAnswer3 = new CorrectAnswer({ value: [['kala'], ['eläin']] })

    // Create some questions
    const options = ['a', 'b', 'c']
    const newGeneralQuestion = new GeneralQuestion({ value: 'test', options: options.concat('test'), type: 'general', groupId: testGroup._id, selectCount: 'selectOne' })
    await newGeneralQuestion.save()
    const q1 = new BaseQuestion({
      type: 'general',
      question: { kind: 'GeneralQuestion', item: newGeneralQuestion._id },
      correctAnswers: newCorrectAnswer1._id,
      concepts: testConcepts
    })
    await q1.save()

    const newGeneralQuestion2 = new GeneralQuestion({ value: 'test2', options: options.concat(['correct1', 'correct2', 'correct3']), type: 'general', groupId: testGroup._id, selectCount: 'selectMany' })
    await newGeneralQuestion2.save()
    const q2 = new BaseQuestion({
      type: 'general',
      question: { kind: 'GeneralQuestion', item: newGeneralQuestion2._id },
      correctAnswers: newCorrectAnswer2._id,
      concepts: testConcepts
    })
    await q2.save()

    const newFillInTheBlankQuestion = new FillInTheBlankQuestion({ value: 'hauki on TYHJÄ ja TYHJÄ' })
    await newFillInTheBlankQuestion.save()
    const q3 = new BaseQuestion({
      type: 'fillInTheBlank',
      question: { kind: 'FillInTheBlankQuestion', item: newFillInTheBlankQuestion._id },
      correctAnswers: newCorrectAnswer3._id,
      concepts: testConcepts
    })
    await q3.save()

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
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(3)
    })
    test('POST', async () => {
      // Test validation
      let response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: ['WRONG!'], type: 'general' })
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('some params missing')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], groupId: testGroup._id , type: 'general' })
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('options missing from general question')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: 'WRONG', groupId: testGroup._id , type: 'general' })
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('options should be of type array')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: [], groupId: testGroup._id , type: 'general' })
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('there should be at least one option')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: ['WRONG'], groupId: testGroup._id , type: 'general', concepts: 'concept' })
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('concepts should be of type array')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: ['WRONG'], groupId: testGroup._id , type: 'general', concepts: [] })
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('there should be at least one concept')

      // Get general questions before adding new ones
      const originalGeneralQuestions = await getQuestionsOfType('general')

      response = await api
        .post(`${testUrl}`)
        .send({ value: '?', correctAnswers: ['a'], options: ['b', 'c', 'd'], groupId: testGroup._id, type: 'general', concepts: [(new Concept({ name: test }))] })
      expect(response.status).toBe(201)

      // A new general question is added
      const updatedGeneralQuestions = await getQuestionsOfType('general')
      expect(updatedGeneralQuestions.length).toBe(originalGeneralQuestions.length + 1)

      // Get fill in the blank questions before adding new ones
      const originalFillInTheBlankQuestions = await getQuestionsOfType('fillInTheBlank')

      response = await api
        .post(`${testUrl}`)
        .send({ value: 'KissaTYHJÄ on TYHJÄ', correctAnswers: [['kala'], ['kala', 'eläin']], groupId: testGroup._id, type: 'fillInTheBlank', concepts: [(new Concept({ name: test }))] })
      expect(response.status).toBe(201)

      // A new fill in the blank question is added
      const updatedFillInTheBlankQuestions = await getQuestionsOfType('fillInTheBlank')
      expect(updatedFillInTheBlankQuestions.length).toBe(originalFillInTheBlankQuestions.length + 1)
    })
  })

  describe(`${testUrl}/:id`, () => {
    test('DELETE', async () => {
      jest.setTimeout(10000)
      // Get initial questions
      const preQuestions = await BaseQuestion.find({})
      expect(preQuestions.length).toBe(3)

      // Create 2 answers for the question that is
      // about to be deleted and 1 for another question
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[0].question.item._id, answer: ['test'] })
        .set('Authorization', `bearer ${ token }`)
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[0].question.item._id, answer: ['test'] })
        .set('Authorization', `bearer ${ token }`)
      await api
        .post(`${testUrl}/answer`)
        .send({ id: preQuestions[1].question.item._id, answer: ['test'] })
        .set('Authorization', `bearer ${ token }`)

      // Delete the first question which is a general question
      let response = await api
        .delete(`${testUrl}/${preQuestions[0]._id}`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('deleted successfully!')

      // Check that there is still one question of type general
      const generalQuestions = await getQuestionsOfType('general')
      expect(generalQuestions.length).toBe(1)

      // Check that all answers relating to the
      // removed question have been deleted
      const postAnswers = await Answer.find({ })
      expect(postAnswers.length).toBe(1)

      // Check that the answers which are linked to the
      // deleted question are removed from the user
      const user = await User.findOne()
      expect(user.answers.length).toBe(1)

      // Check that the correct answers which are linked
      // to the deleted question are removed
      const correctAnswers = await CorrectAnswer.find()
      expect(correctAnswers.length).toBe(1)

      // Check that only 1 question has been removed
      let postQuestions = await BaseQuestion.find()
      expect(postQuestions.length).toBe(2)

      // Delete a fillInTheBlankQuestion as well
      response = await api
        .delete(`${testUrl}/${preQuestions[2]._id}`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('deleted successfully!')

      //Check that there is only one question left
      postQuestions = await BaseQuestion.find()
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


/*   describe(`${testUrl}/answer`, () => {
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

      // Check for correct answer
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
      console.log(token)

      // Check that user has been linked to their answers
      const user = await User.findOne()
      expect(user.answers.length).toBe(2)


      // Check that skipping questions works as intended
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
      expect(response.body.message).toBeDefined()
    })
  }) */
})

afterAll(() => {
  server.close()
})