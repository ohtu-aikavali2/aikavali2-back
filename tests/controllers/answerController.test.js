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
    await Answer.remove({})
    await User.remove({})

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

  describe(`${apiUrl}/:userId`, () => {
    test('GET', async () => {
      // Validation
      let response = await api
        .get(`${testUrl}/123`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('malformed id')

      // Check that all answers are returned
      response = await api
        .get(`${testUrl}/${user.id}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })
  })
})

afterAll(() => {
  server.close()
})