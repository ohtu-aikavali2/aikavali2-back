const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const BaseQuestion = require('../../src/models/baseQuestion')
const PrintQuestion = require('../../src/models/printQuestion')
const CompileQuestion = require('../../src/models/compileQuestion')
const CorrectAnswer = require('../../src/models/correctAnswer')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/questions`

const getQuestionsOfType = async (type) => {
  switch (type) {
    case 'base': return await BaseQuestion.find({})
    case 'compile': return await CompileQuestion.find({})
    case 'print': return await PrintQuestion.find({})
  }
}

describe('question controller', () => {
  let token

  beforeEach(async () => {
    await BaseQuestion.remove({})
    await PrintQuestion.remove({})
    await CompileQuestion.remove({})
    await CorrectAnswer.remove({})

    const newCorrectAnswer = new CorrectAnswer({ value: 'test' })
    await newCorrectAnswer.save()
    const options = ['a', 'b', 'c']
    const newPrintQuestion = new PrintQuestion({ value: 'test', options: options.concat('test') })
    await newPrintQuestion.save()
    const q1 = new BaseQuestion({
      type: 'print',
      question: { kind: 'PrintQuestion', item: newPrintQuestion._id },
      correctAnswer: newCorrectAnswer._id
    })
    await q1.save()

    const newCompileQuestion = new CompileQuestion({ options: options.concat('test') })
    await newCompileQuestion.save()
    const q2 = new BaseQuestion({
      type: 'compile',
      question: { kind: 'CompileQuestion', item: newCompileQuestion._id },
      correctAnswer: newCorrectAnswer._id
    })
    await q2.save()

    await User.remove({})
    const response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token
  })

  describe(testUrl, () => {
    test('GET', async () => {
      const response = await api
        .get(testUrl)
      expect(response.body.length).toBe(2)
    })
  })

  describe(`${testUrl}/random`, () => {
    test('GET', async () => {
      const response = await api
        .get(`${testUrl}/random`)
      expect(response.body.item.options.length).toBe(4)
    })
  })

  describe(`${testUrl}/print`, () => {
    test('POST', async () => {
      const originalPrintQuestions = await getQuestionsOfType('print')
      await api
        .post(`${testUrl}/print`)
        .send({ value: '?', correctAnswer: 'a', options: ['b', 'c', 'd'] })
      const updatedPrintQuestions = await getQuestionsOfType('print')
      expect(updatedPrintQuestions.length).toBe(originalPrintQuestions.length + 1)

      const response = await api
        .post(`${testUrl}/print`)
        .send({})
      expect(response.status).toBe(422)
      expect(response.body.error).toBeTruthy()
    })
  })

  describe(`${testUrl}/compile`, () => {
    test('POST', async () => {
      const originalCompileQuestions = await getQuestionsOfType('compile')
      await api
        .post(`${testUrl}/compile`)
        .send({ correctAnswer: 'a', options: ['b', 'c', 'd'] })
      const updatedCompileQuestions = await getQuestionsOfType('compile')
      expect(updatedCompileQuestions.length).toBe(originalCompileQuestions.length + 1)

      const response = await api
        .post(`${testUrl}/compile`)
        .send({})
      expect(response.status).toBe(422)
      expect(response.body.error).toBeTruthy()
    })
  })

  describe(`${testUrl}/answer`, () => {
    test('POST', async () => {
      const questions = await BaseQuestion.find({}).populate('question.item')
      let response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'test' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.isCorrect).toBe(true)
      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'wrong' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.isCorrect).toBe(false)
      expect(response.body.correctAnswer).toBe('test')
    })
  })
})

afterAll(() => {
  server.close()
})