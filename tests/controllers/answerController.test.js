const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const User = require('../../src/models/user')
const Answer = require('../../src/models/answer')
const testUrl = `${apiUrl}/answer`

describe('answer controller', () => {
  let user

  beforeEach(async () => {
    // Remove all DB entities
    await Answer.deleteMany()
    await User.deleteMany()

    // Generate a user
    const response = await api
      .post(`${apiUrl}/user/generate`)
    user = response.body

    // Create some answer entities
    const answer1 = new Answer({ user: user.id })
    await answer1.save()
    const answer2 = new Answer({ user: user.id })
    await answer2.save()
  })

  describe(`${testUrl}/:userId`, () => {
    test('GET', async () => {
      // Check that all answers are returned
      const response = await api
        .get(`${testUrl}/${user.id}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })
  })
})

afterAll(() => {
  server.close()
})