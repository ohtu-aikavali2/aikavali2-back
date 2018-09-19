const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const BaseQuestion = require('../../src/models/baseQuestion')
const PrintQuestion = require('../../src/models/printQuestion')
const CompileQuestion = require('../../src/models/compileQuestion')
const CorrectAnswer = require('../../src/models/correctAnswer')
const testUrl = `${apiUrl}/questions`

describe('question controller', () => {

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

  describe(`${testUrl}/answer`, () => {
    test('GET', async () => {
      const questions = await BaseQuestion.find({}).populate('question.item')
      let response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'test' })
      expect(response.body.isCorrect).toBe(true)
      response = await api
        .post(`${testUrl}/answer`)
        .send({ id: questions[0].question.item._id, answer: 'wrong' })
      expect(response.body.isCorrect).toBe(false)
    })
  })
})

afterAll(() => {
  server.close()
})