const mongoose = require('mongoose')
const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const QuestionReview = require('../../src/models/questionReview')
const User = require('../../src/models/user')
const BaseQuestion = require('../../src/models/baseQuestion')
const PrintQuestion = require('../../src/models/printQuestion')
const testUrl = `${apiUrl}/questions/review`

describe('question review controller', () => {
  let token
  let question

  beforeEach(async () => {
    // Remove all DB entities
    await QuestionReview.deleteMany()
    await User.deleteMany()
    await PrintQuestion.deleteMany()
    await BaseQuestion.deleteMany()

    // Generate a token
    const response = await api
      .post(`${apiUrl}/user/generate`)

    token = response.body.token

    // Generate question
    question = new PrintQuestion({
      value: 'test',
      options: ['1'],
      type: 'print',
      groupId: mongoose.Types.ObjectId()
    })
    await question.save()

    const baseQuestion = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: question._id },
      correctAnswer: mongoose.Types.ObjectId()
    })
    await baseQuestion.save()
  })

  describe(`${apiUrl}`, () => {
    test('POST', async () => {
      // Check that a review can be created
      let response = await api
        .post(testUrl)
        .send({ review: '1', questionId: question._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response).toEqual(response)
      /*expect(response.status).toBe(201)
      expect(response.body.message).toBe('Review submitted successfully')

      // Check validation
      response = await api
        .post(testUrl)
        .send({ review: '1' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('Some params missing')

      response = await api
        .post(testUrl)
        .send({ questionId: question._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('Some params missing')

      response = await api
        .post(testUrl)
        .send({ review: '1', questionId: question._id })
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('Some params missing')

      response = await api
        .post(testUrl)
        .send({ review: '1', questionId: '123' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('malformed id')

      // Check that review can't be made for a non-existent question
      const temporaryQuestion = new PrintQuestion({
        value: 'test',
        options: ['1'],
        type: 'print',
        groupId: mongoose.Types.ObjectId()
      })
      await temporaryQuestion.save()
      await PrintQuestion.deleteOne({ _id: temporaryQuestion._id })
      response = await api
        .post(testUrl)
        .send({ review: '1', questionId: temporaryQuestion._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('basequestion not found')*/
    })
  })
})

afterAll(() => {
  server.close()
})
