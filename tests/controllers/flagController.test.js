const mongoose = require('mongoose')
const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Flag = require('../../src/models/flag')
const User = require('../../src/models/user')
const BaseQuestion = require('../../src/models/baseQuestion')
const PrintQuestion = require('../../src/models/printQuestion')
const testUrl = `${apiUrl}/flags`

describe('answer controller', () => {
  let token
  let user
  let question
  let baseQuestion
  let flag

  beforeEach(async () => {
    // Remove all DB entities
    await Flag.deleteMany()
    await User.deleteMany()
    await PrintQuestion.deleteMany()
    await BaseQuestion.deleteMany()

    // Generate a user
    const response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token

    question = new PrintQuestion({
      value: 'test',
      options: ['1'],
      type: 'print',
      groupId: mongoose.Types.ObjectId()
    })
    await question.save()

    baseQuestion = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: question._id },
      correctAnswer: mongoose.Types.ObjectId()
    })
    await baseQuestion.save()
    user = await User.findOne()
    flag = new Flag({
      question: baseQuestion._id,
      user
    })
    await flag.save()
  })

  describe(`${testUrl}`, () => {
    test('GET', async () => {
      let response = await api
        .get(testUrl)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(1)
    })

    test('POST', async () => {
      // Check that a flag can be created
      let response = await api
        .post(testUrl)
        .send({ questionID: baseQuestion._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(201)

      // Check validation
      response = await api
        .post(testUrl)
        .send({ questionID: '123' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Question ID malformed!')

      const temporaryQuestion = new BaseQuestion({
        type: 'print',
        question: { kind: 'PrintQuestion', item: question._id },
        correctAnswer: mongoose.Types.ObjectId()
      })
      await temporaryQuestion.save()
      await BaseQuestion.deleteOne({ _id: temporaryQuestion._id })
      response = await api
        .post(testUrl)
        .send({ questionID: temporaryQuestion._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('No question found!')

      response = await api
        .post(testUrl)
        .send({ questionID: baseQuestion._id })
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('Missing token!')
    })
  })

  describe(`${testUrl}/question/:id`, async () => {
    test('GET', async () => {
      let response = await api
        .get(`${testUrl}/question/${baseQuestion._id}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(1)
    })
  })

  describe(`${testUrl}/:id`, async () => {
    test('GET', async () => {
      let response = await api
        .get(`${testUrl}/${flag._id}`)
      expect(response.status).toBe(200)
      expect(response.body._id).toBe(String(flag._id))
    })
  })
})

afterAll(() => {
  server.close()
})